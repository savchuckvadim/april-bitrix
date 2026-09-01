import {
    Counter,
    Gauge,
    Histogram,
    Registry,
    collectDefaultMetrics,
} from 'prom-client';

import {
    DOMAIN_LABEL,
    METRIC_SPECS,
    OTHER_LABEL_VALUE,
} from '@/modules/shared/metrics/lib/metric-contract';
import {
    METRIC,
    type SerializedMetricEvent,
} from '@/modules/shared/metrics/model/metric-event.type';

/**
 * Реестр метрик приложения — ОДИН на процесс.
 *
 * Почему вынесен из маршрута: реестров теперь два потребителя — отдача
 * (`GET /api/metrics`, его скрейпит Prometheus из back/infra) и приём событий
 * браузера (`POST /api/metrics/report`). Пока реестр создавался прямо в
 * route.ts, второй маршрут физически не мог инкрементить то, что отдаёт
 * первый: в Next каждый route-модуль сам по себе.
 *
 * ПОЧЕМУ СИНГЛТОН НА globalThis, А НЕ ПРОСТО МОДУЛЬНАЯ КОНСТАНТА. В dev Next
 * пересобирает и переисполняет модули при каждом hot-reload. Модульная
 * константа при этом создаётся заново, а prom-client бросает на повторной
 * регистрации метрики с тем же именем — приложение падало бы на первом же
 * сохранении файла. `globalThis` переживает переисполнение модуля, поэтому
 * бандл метрик кладётся туда под `Symbol.for` (общий ключ на все копии
 * модуля, в том числе из разных бандлов Next) и создаётся ровно однажды.
 * Приём тот же, каким в Node переживают hot-reload соединения с БД.
 */

/** Ключ синглтона. `Symbol.for` — общий реестр символов на весь процесс. */
const METRICS_KEY = Symbol.for('event-sales.metrics.business');

/**
 * Корзины времени первой загрузки, СЕКУНДЫ.
 *
 * Подобраны под реальность фрейма Битрикса, а не под «типовой веб»: до списка
 * дел успевают отработать загрузка бандла, `Bitrix.start`, слепок портала и
 * запрос дел. Тёплый старт (слепок и настройки из swrCache) укладывается в
 * 1–2 с — там корзины частые, потому что именно там живёт норма и именно там
 * будет видно ухудшение. Дальше шаг растёт: 5–12 с — «менеджер уже понял, что
 * тормозит», 20–45 — «ушёл пить кофе», и различать 31 с и 34 с бессмысленно.
 * Нижняя граница 0.5 с — быстрее фрейм не открывается физически.
 */
export const BOOT_BUCKETS = [0.5, 1, 1.5, 2, 3, 4, 6, 8, 12, 20, 30, 45];

/**
 * Потолок РАЗНЫХ доменов в метках. Всё сверх потолка честно ложится в
 * `other`.
 *
 * ЧИСЛО ВЗЯТО ОТ РЕАЛЬНОСТИ, А НЕ ОТ ПОТОЛКА. Боевых порталов у приложения
 * шесть (DOMAIN_OVERRIDES в modules/app/consts/domain-config.ts), плюс
 * тестовые и будущие — 50 это запас почти на порядок и «десятки», о которых
 * идёт речь, а не абстрактные сотни.
 *
 * Почему это вообще важно. Метка домена умножается на все остальные метки:
 * у одной только гистограммы фаз это 7 фаз × 15 строк экспозиции на серию.
 * При 300 доменах худший случай — около 70 тысяч временных рядов из ОДНОГО
 * процесса, и ни один из них не удаляется до рестарта: TTL у prom-client
 * нет. При 50 худший случай меньше 12 тысяч. Второй рубеж — белый список
 * доменов портала (sanitizeDomainLabel): случайная строка сюда уже не
 * доходит, потолок остался как страховка на случай потока РАЗНЫХ поддоменов
 * bitrix24.
 */
export const MAX_DOMAINS = 50;

interface BusinessMetrics {
    registry: Registry;
    bootPhase: Histogram<'phase' | 'domain'>;
    bootToTasks: Histogram<'domain'>;
    /** ПОПЫТКИ: сколько раз стучались в цель. Ретраи считаются каждый. */
    deliveryAttempt: Counter<'outcome' | 'target' | 'domain'>;
    /** СУДЬБА: ровно один терминальный исход на конверт (см. контракт). */
    reportOutcome: Counter<'outcome' | 'domain'>;
    /**
     * GAUGE, а не счётчик: это УРОВЕНЬ («сколько лежит»), а не событие
     * («сколько раз случилось»). Счётчик здесь был бы прямой ложью — он умеет
     * только расти, а конверты как копятся, так и разъезжаются.
     *
     * ЧЕСТНАЯ ОГОВОРКА, ВЫНЕСЕННАЯ В ИМЯ. Конверты живут в IndexedDB
     * КОНКРЕТНОГО браузера, значение публикует каждая вкладка по итогу своего
     * прогона дренажа, а экземпляров Next несколько — в серии остаётся замер
     * ПОСЛЕДНЕГО, кто написал: ни сумма, ни максимум. Суммировать нечем: для
     * этого понадобилась бы метка с идентификатором вкладки или менеджера, а
     * такие метки запрещены. Поэтому метрика называется `..._last_seen_...`:
     * она отвечает на «где-то лежат застрявшие отчёты», а точное количество
     * берётся из `event_sales_report_outcome_total` (сколько отправок
     * началось против того, сколько чем-то закончилось).
     */
    outboxBacklog: Gauge<'state' | 'domain'>;
    checklistQuestionHidden: Counter<'reason' | 'channel' | 'domain'>;
    send: Counter<'kind' | 'domain'>;
    /** Домены, уже попавшие в метки, — гард кардинальности. */
    domains: Set<string>;
}

type GlobalWithMetrics = typeof globalThis & {
    [METRICS_KEY]?: BusinessMetrics;
};

const createBusinessMetrics = (): BusinessMetrics => {
    const registry = new Registry();
    // Стандартные показатели процесса Node (память, GC, задержки event loop)
    // остаются: бизнес-метрики их дополняют, а не заменяют.
    collectDefaultMetrics({ register: registry });

    return {
        registry,
        bootPhase: new Histogram({
            name: METRIC.bootPhase,
            help: METRIC_SPECS[METRIC.bootPhase].help,
            labelNames: ['phase', DOMAIN_LABEL],
            buckets: BOOT_BUCKETS,
            registers: [registry],
        }),
        bootToTasks: new Histogram({
            name: METRIC.bootToTasks,
            help: METRIC_SPECS[METRIC.bootToTasks].help,
            labelNames: [DOMAIN_LABEL],
            buckets: BOOT_BUCKETS,
            registers: [registry],
        }),
        deliveryAttempt: new Counter({
            name: METRIC.deliveryAttempt,
            help: METRIC_SPECS[METRIC.deliveryAttempt].help,
            labelNames: ['outcome', 'target', DOMAIN_LABEL],
            registers: [registry],
        }),
        reportOutcome: new Counter({
            name: METRIC.reportOutcome,
            help: METRIC_SPECS[METRIC.reportOutcome].help,
            labelNames: ['outcome', DOMAIN_LABEL],
            registers: [registry],
        }),
        outboxBacklog: new Gauge({
            name: METRIC.outboxBacklog,
            help: METRIC_SPECS[METRIC.outboxBacklog].help,
            labelNames: ['state', DOMAIN_LABEL],
            registers: [registry],
        }),
        checklistQuestionHidden: new Counter({
            name: METRIC.checklistQuestionHidden,
            help: METRIC_SPECS[METRIC.checklistQuestionHidden].help,
            labelNames: ['reason', 'channel', DOMAIN_LABEL],
            registers: [registry],
        }),
        send: new Counter({
            name: METRIC.send,
            help: METRIC_SPECS[METRIC.send].help,
            labelNames: ['kind', DOMAIN_LABEL],
            registers: [registry],
        }),
        domains: new Set<string>(),
    };
};

export const getBusinessMetrics = (): BusinessMetrics => {
    const scope = globalThis as GlobalWithMetrics;
    const existing = scope[METRICS_KEY];
    if (existing) return existing;
    const created = createBusinessMetrics();
    scope[METRICS_KEY] = created;
    return created;
};

/**
 * Домен в пределах потолка; всё сверх — `other`. Уже виденный домен проходит
 * всегда: потолок не должен «выключать» рабочий портал только потому, что
 * перед ним прошёл мусор.
 */
export const capDomainValue = (
    seen: Set<string>,
    domain: string,
    max: number = MAX_DOMAINS,
): string => {
    if (seen.has(domain)) return domain;
    if (seen.size >= max) return OTHER_LABEL_VALUE;
    seen.add(domain);
    return domain;
};

/**
 * Записать одно уже проверенное событие в реестр.
 *
 * Вход — только результат `serializeMetricEvent`: имя из белого списка, метки
 * по спеке, значение в пределах потолка. Здесь остаётся адресация — какой
 * именно метрике достанется событие.
 *
 * Не бросает никогда: маршрут приёма обязан отвечать одинаково и на хорошее
 * тело, и на странное. Возвращает признак «записано» — маршрут им ничего не
 * решает, он нужен тестам и будущей диагностике.
 */
export const recordMetricEvent = (event: SerializedMetricEvent): boolean => {
    try {
        const metrics = getBusinessMetrics();
        const labels = { ...event.labels };
        const domain = labels[DOMAIN_LABEL];
        if (typeof domain === 'string') {
            labels[DOMAIN_LABEL] = capDomainValue(metrics.domains, domain);
        }

        switch (event.name) {
            case METRIC.bootPhase:
                metrics.bootPhase.observe(labels, event.value);
                return true;
            case METRIC.bootToTasks:
                metrics.bootToTasks.observe(labels, event.value);
                return true;
            case METRIC.deliveryAttempt:
                metrics.deliveryAttempt.inc(labels, event.value);
                return true;
            case METRIC.reportOutcome:
                metrics.reportOutcome.inc(labels, event.value);
                return true;
            case METRIC.outboxBacklog:
                metrics.outboxBacklog.set(labels, event.value);
                return true;
            case METRIC.checklistQuestionHidden:
                metrics.checklistQuestionHidden.inc(labels, event.value);
                return true;
            case METRIC.send:
                metrics.send.inc(labels, event.value);
                return true;
            default:
                return false;
        }
    } catch {
        // Метрика не имеет права уронить запрос — см. шапку маршрута приёма.
        return false;
    }
};
