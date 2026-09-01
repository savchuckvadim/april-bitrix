import { METRIC, type MetricName } from '../model/metric-event.type';

/**
 * Контракт бизнес-метрик: какие метки у метрики есть и какие значения им
 * разрешены. Один файл — истина и для браузера (что можно послать), и для
 * маршрута приёма (что вообще принимать).
 *
 * ПОЧЕМУ БЕЛЫЙ СПИСОК, А НЕ СВОБОДНЫЕ МЕТКИ. Каждая пара «метка = значение» —
 * это отдельная временная серия в Prometheus. Свободные метки из браузера
 * означают, что любой баг (или чужой запрос на открытый маршрут) множит серии
 * без предела и кладёт хранилище. Поэтому имена метрик, ключи меток и почти
 * все значения перечислены заранее.
 *
 * ДОМЕН ПОРТАЛА — ДА. Порталов десятки, разрез по ним владельцу нужен: «на
 * этом портале бут вдвое дольше» — рабочий вопрос. Свободным это значение всё
 * же не является: домен проходит нормализацию И белый список порталов
 * (sanitizeDomainLabel), чужое ложится в `other`, а число РАЗНЫХ доменов
 * дополнительно ограничено на сервере (см. app/lib/metrics/registry.ts).
 * Периметр вокруг самих маршрутов — docs/metrics-endpoint-security.md.
 *
 * ИДЕНТИФИКАТОРЫ МЕНЕДЖЕРОВ, СДЕЛОК, ЗАДАЧ — КАТЕГОРИЧЕСКИ НЕТ. Это разом
 * взрыв кардинальности (тысячи сделок = тысячи серий) и персональные данные в
 * системе, которая не про людей, а про поведение приложения. Запрет защищён
 * отдельно и грубо: событие с такой меткой отбрасывается ЦЕЛИКОМ (см.
 * FORBIDDEN_LABEL_KEY) — потерять замер дешевле, чем утечь.
 */

/** Куда браузер шлёт пачку. Свой домен, никаких внешних адресов. */
export const METRICS_REPORT_PATH = '/api/metrics/report';

/** Метка портала — единственная со свободным значением. */
export const DOMAIN_LABEL = 'domain';

/** Метка не пришла вовсе. */
export const UNKNOWN_LABEL_VALUE = 'unknown';

/**
 * Значение пришло, но его нет в белом списке. Схлопываем, а не выбрасываем
 * событие: «случилось что-то новое» — тоже сигнал, и увидеть его кучей лучше,
 * чем не увидеть никак. Кардинальность при этом не растёт.
 */
export const OTHER_LABEL_VALUE = 'other';

/**
 * ОБЩИЙ потолок значения — только для СЧЁТЧИКОВ. У счётчика значение это
 * приращение, и миллион в нём виден как ступенька на графике: `rate()`
 * переживёт, соседние точки не испорчены.
 *
 * Гистограммам и gauge этот потолок не годится, и это не вкусовщина. У
 * гистограммы `_sum` — накопительный итог за всю жизнь процесса: одно
 * наблюдение в миллион секунд навсегда (до рестарта) ломает среднюю
 * `rate(_sum)/rate(_count)`, то есть ровно ту цифру первой загрузки, ради
 * которой метрика заведена. Поэтому потолок задаётся ПОСПЕКОВНО — см.
 * `MetricSpec.maxValue`.
 */
export const MAX_METRIC_VALUE = 1_000_000;

/**
 * Потолок наблюдения в СЕКУНДАХ: верхняя корзина гистограмм бута (45 с,
 * `BOOT_BUCKETS` в app/lib/metrics/registry.ts) ×2.
 *
 * Почему ×2, а не ровно верхняя корзина: наблюдение выше последней корзины —
 * законное («фрейм открывался минуту»), и подрезать его до 45 значило бы
 * врать про `_sum`. А ×2 = 90 всё ещё величина того же порядка: пачка таких
 * наблюдений среднюю сдвинет, но не уничтожит, и разбор займёт минуты, а не
 * останется навсегда. Совпадение с корзинами проверяет тест реестра.
 */
export const MAX_SECONDS_VALUE = 90;

/**
 * Потолок УРОВНЯ конвертов в gauge. Конверт — это отчёт менеджера; тысяча
 * непроведённых на одном портале уже катастрофа, десять тысяч — величина, за
 * которой считать нечего. Потолок держит «на портале миллион застрявших
 * отчётов» вне графика: gauge показывает последний замер, и одна анонимная
 * пачка иначе рисовала бы аварию, которой нет.
 */
export const MAX_ENVELOPES_VALUE = 10_000;

/** Сколько событий берём из одной пачки. Остальное отбрасываем. */
export const MAX_EVENTS_PER_BATCH = 200;

/**
 * Потолок тела пачки на маршруте приёма, БАЙТЫ. Живёт здесь, а не в
 * route.ts, ровно потому, что это контракт ДВУХ сторон: клиент шлёт не больше
 * `MAX_EVENTS_PER_BATCH` событий, маршрут обязан такую пачку принять.
 *
 * Арифметика: самое длинное событие — `checklist_question_hidden` со всеми
 * метками и 64-символьным доменом, это ~200 байт JSON; 200 × 200 ≈ 40 КБ.
 * 32 КБ, стоявшие тут раньше, полную пачку РЕЗАЛИ: маршрут отвечал 413, а
 * клиент чистит буфер ДО отправки — пачка терялась целиком, и терялась она
 * именно в интересный момент (прогон дренажа с десятками конвертов). 64 КБ
 * покрывают худший случай с запасом в полтора раза. Совпадение проверяет
 * тест контракта.
 */
export const MAX_BODY_BYTES = 64 * 1024;

export const METRIC_KIND = {
    counter: 'counter',
    gauge: 'gauge',
    histogram: 'histogram',
} as const;
export type MetricKind = (typeof METRIC_KIND)[keyof typeof METRIC_KIND];

export interface MetricSpec {
    kind: MetricKind;
    /** Человеческое описание — уходит в HELP при регистрации. */
    help: string;
    /** Объявленные метки. Ключей вне списка в серии не будет никогда. */
    labels: readonly string[];
    /**
     * Допустимые значения метки. `null` — значение свободное (только домен):
     * проходит нормализацию, но не сверку со списком.
     */
    values: Readonly<Record<string, readonly string[] | null>>;
    /**
     * Потолок значения ИМЕННО ЭТОЙ метрики. Поле обязательное намеренно:
     * новая метрика не заведётся, пока автор не ответит, какое число для неё
     * невозможно. Общий `MAX_METRIC_VALUE` подходит только счётчикам.
     */
    maxValue: number;
}

/**
 * Фазы бута — ровно те, что расставлены метками в app-init.util.ts.
 * Дрейф этого списка относительно типа `BootPhase` ловит тайпчек в тесте
 * (metric-contract.test.ts): молча разошедшийся список означал бы, что новая
 * фаза попадает в `other` и на графике её нет.
 */
export const BOOT_PHASE_VALUES = [
    'init-start',
    'bitrix-started',
    'portal-fetched',
    'entities-resolved',
    'splash-off',
    'app-config-done',
    'tasks-fetched',
    // ИСХОД списка дел. `tasks-fetched` теперь наступает во ВСЕХ терминальных
    // ветках списка, иначе главная цифра молчала на встройке задачи, пустом
    // списке и упавшем запросе. Чтобы воронка не смешивала «медленно» с
    // «дел нет» и «запрос упал», исход отмечается отдельной фазой.
    'tasks-empty',
    'tasks-error',
] as const;

/**
 * Исходы ОБРАЩЕНИЯ К ЦЕЛИ — зеркало OUTBOX_DELIVERY_OUTCOME без
 * `unavailable`.
 *
 * `unavailable` («цель пропущена как неготовая») сюда не входит намеренно:
 * счётчик попыток его не пишет вовсе (см. deliverToTarget), то есть в белом
 * списке он был мёртвым значением — лишняя пара серий на каждую цель и
 * каждый портал за ноль пользы. Прилети такое значение — оно честно ляжет в
 * `other`, и это будет видно как «случилось что-то новое».
 */
export const DELIVERY_TARGET_OUTCOME_VALUES = [
    /** Принят сервером: бэк взял операцию, исход отдаст поллинг. */
    'accepted',
    /** Отвергнут: 4xx или бизнес-отказ, авторетраев не будет. */
    'rejected',
    /** Сеть молчала. */
    'network-error',
    /** Сервер ответил ошибкой. */
    'server-error',
    /** Исполнен напрямую браузером. */
    'executed-direct',
    /** Исполнен напрямую НЕ ЦЕЛИКОМ — самый тревожный исход. */
    'direct-incomplete',
] as const;

/**
 * Исходы ПОПЫТКИ сдвинуть конверт: обращения к цели плюс сверка статуса в
 * дренаже, которая ответа не дала. Сверка — тоже попытка: конверт не поехал,
 * и её частота ровно так же отвечает на «бэк недоступен, а отчёты копятся».
 */
export const DELIVERY_ATTEMPT_OUTCOME_VALUES = [
    ...DELIVERY_TARGET_OUTCOME_VALUES,
    /** Сверка статуса в дренаже не дала ответа — конверт не сдвинулся. */
    'status-unavailable',
] as const;

/**
 * ТЕРМИНАЛЬНАЯ судьба конверта — ровно одна на конверт за всю его жизнь.
 *
 * Отдельный список от исходов попытки, потому что вопросы разные. Попытка
 * отвечает «как прошло обращение к цели» (и повторяется десятками раз при
 * молчащем бэке), терминальный исход — «чем ЗАКОНЧИЛСЯ отчёт менеджера».
 * `accepted` терминальным исходом не является: «бэк взял операцию» — это
 * ещё не проведённый отчёт, настоящий исход приходит поллингом статуса.
 */
export const REPORT_OUTCOME_VALUES = [
    /** Проведён: бэк подтвердил done либо браузер исполнил его целиком. */
    'delivered',
    /** Отвергнут сервером или целью: авторетраев не будет, чинит человек. */
    'rejected',
    /** Проведён НЕ ЦЕЛИКОМ: батч ушёл, обязательная часть не применилась. */
    'incomplete',
    /** Застрял навсегда: операция принималась, статус истёк, повтор запрещён. */
    'stuck',
] as const;

/** Цели доставки — зеркало реестра delivery-targets. */
export const DELIVERY_TARGET_VALUES = [
    'primary-backend',
    'direct-bitrix',
] as const;

/** Что именно считает gauge остатка конвертов. */
export const OUTBOX_STATE_VALUES = [
    /** Ещё не доставлены (в том числе ждущие дренажа). */
    'undelivered',
    /** Ядро исполнено напрямую, хвост ждёт досылки. */
    'partial',
    /** Проведены не целиком — чинит человек. */
    'incomplete',
] as const;

/**
 * Почему вопрос анкеты не показался. Список снят с реальных веток `null` в
 * resolveChecklistField (features/CallChecklist/lib/checklist-values.ts) —
 * это ровно те молчаливые отказы, из-за которых владелец потерял час на
 * «включил настройку, а вопросов нет».
 */
export const HIDDEN_QUESTION_REASON_VALUES = [
    /** Носителя нет: ни у одной сущности нет строки или ID. */
    'no-carrier',
    /** Встроенный вопрос: поля нет в слепке портала. */
    'field-not-in-portal',
    /** Справочник без вариантов — отвечать нечем. */
    'enum-without-options',
    /** crm-вопрос вообще без адреса поля: писать некуда. */
    'no-field-in-crm',
] as const;

/** Каналы вопроса — зеркало QuestionnaireChannel. */
export const QUESTION_CHANNEL_VALUES = ['crm', 'dto', 'smart', 'text'] as const;

/** Вид отправки — зеркало OUTBOX_ENVELOPE_KIND. */
export const SEND_KIND_VALUES = ['report', 'nocall'] as const;

/**
 * Типы значений меток — чтобы врезка в бизнес-код не могла передать строку,
 * которой в контракте нет: опечатка в `outcome` иначе тихо схлопнулась бы в
 * `other`, и на графике исход выглядел бы «каким-то новым». Тайпчек ловит её
 * на месте вызова, а совпадение этих списков с перечислениями бизнес-кода
 * проверено в metric-contract.test.ts.
 */
export type BootPhaseLabel = (typeof BOOT_PHASE_VALUES)[number];
export type DeliveryAttemptOutcomeLabel =
    (typeof DELIVERY_ATTEMPT_OUTCOME_VALUES)[number];
export type ReportOutcomeLabel = (typeof REPORT_OUTCOME_VALUES)[number];
export type OutboxStateLabel = (typeof OUTBOX_STATE_VALUES)[number];
export type HiddenQuestionReasonLabel =
    (typeof HIDDEN_QUESTION_REASON_VALUES)[number];
export type QuestionChannelLabel = (typeof QUESTION_CHANNEL_VALUES)[number];
export type SendKindLabel = (typeof SEND_KIND_VALUES)[number];

export const METRIC_SPECS: Readonly<Record<MetricName, MetricSpec>> = {
    [METRIC.bootPhase]: {
        kind: METRIC_KIND.histogram,
        help: 'Время от навигации документа до фазы первой загрузки, сек',
        labels: ['phase', DOMAIN_LABEL],
        values: { phase: BOOT_PHASE_VALUES, [DOMAIN_LABEL]: null },
        maxValue: MAX_SECONDS_VALUE,
    },
    [METRIC.bootToTasks]: {
        kind: METRIC_KIND.histogram,
        help: 'Первая загрузка целиком: от навигации до списка дел, сек',
        labels: [DOMAIN_LABEL],
        values: { [DOMAIN_LABEL]: null },
        maxValue: MAX_SECONDS_VALUE,
    },
    [METRIC.deliveryAttempt]: {
        kind: METRIC_KIND.counter,
        help:
            'ПОПЫТКИ доставки отчёта: каждое обращение к цели, включая ретраи ' +
            'бэкоффа и повторы дренажа. Долю успеха по нему НЕ считать — ' +
            'знаменатель растёт от одних лишь ретраев; для доли есть ' +
            'event_sales_report_outcome_total',
        labels: ['outcome', 'target', DOMAIN_LABEL],
        values: {
            outcome: DELIVERY_ATTEMPT_OUTCOME_VALUES,
            target: DELIVERY_TARGET_VALUES,
            [DOMAIN_LABEL]: null,
        },
        maxValue: MAX_METRIC_VALUE,
    },
    [METRIC.reportOutcome]: {
        kind: METRIC_KIND.counter,
        help:
            'СУДЬБА отчёта: ровно один терминальный исход на конверт — ' +
            'проведён, отвергнут сервером, проведён не целиком, застрял. ' +
            'Разница с event_sales_send_total — отчёты, висящие без исхода',
        labels: ['outcome', DOMAIN_LABEL],
        values: {
            outcome: REPORT_OUTCOME_VALUES,
            [DOMAIN_LABEL]: null,
        },
        maxValue: MAX_METRIC_VALUE,
    },
    [METRIC.outboxBacklog]: {
        kind: METRIC_KIND.gauge,
        help:
            'Остаток конвертов, увиденный ОДНОЙ вкладкой по итогу её прогона ' +
            'дренажа. Значение перезаписывает любая следующая вкладка и любой ' +
            'экземпляр приложения: это индикатор «где-то лежит столько-то», а ' +
            'не итог по порталу — итог считается по ' +
            'event_sales_report_outcome_total',
        labels: ['state', DOMAIN_LABEL],
        values: { state: OUTBOX_STATE_VALUES, [DOMAIN_LABEL]: null },
        maxValue: MAX_ENVELOPES_VALUE,
    },
    [METRIC.checklistQuestionHidden]: {
        kind: METRIC_KIND.counter,
        help: 'Вопрос анкеты не показан менеджеру: причина и канал',
        labels: ['reason', 'channel', DOMAIN_LABEL],
        values: {
            reason: HIDDEN_QUESTION_REASON_VALUES,
            channel: QUESTION_CHANNEL_VALUES,
            [DOMAIN_LABEL]: null,
        },
        maxValue: MAX_METRIC_VALUE,
    },
    [METRIC.send]: {
        kind: METRIC_KIND.counter,
        help: 'Отправки всего: отчёты и недозвоны',
        labels: ['kind', DOMAIN_LABEL],
        values: { kind: SEND_KIND_VALUES, [DOMAIN_LABEL]: null },
        maxValue: MAX_METRIC_VALUE,
    },
};

/**
 * Ключи, которых в метках не должно быть НИКОГДА — грубый и намеренно широкий
 * фильтр поверх белого списка.
 *
 * Белый список сам по себе уже не пропустил бы `dealId`. Этот гард стоит
 * ВТОРЫМ слоем и ловит другую ошибку: не кривой запрос, а собственную будущую
 * правку, где кто-то допишет `userId` в labels метрики и не заметит. Поэтому
 * он срабатывает не «выкинуть метку», а «выкинуть событие целиком»: тихо
 * потерянный замер заметят и починят, тихо утёкшие идентификаторы — нет.
 */
export const FORBIDDEN_LABEL_WORDS: ReadonlySet<string> = new Set([
    'id',
    'ids',
    'uid',
    'uuid',
    'guid',
    'user',
    'users',
    'manager',
    'employee',
    'deal',
    'deals',
    'lead',
    'leads',
    'task',
    'tasks',
    'company',
    'contact',
    'client',
    'activity',
    'element',
    'item',
    'items',
    'phone',
    'email',
    'login',
    'fio',
    'name',
    'title',
    'comment',
    'text',
    'url',
    'token',
    'session',
    'ip',
]);

/**
 * Ключ по словам: `userId`, `user_id`, `user-id` и `USER.ID` — одно и то же,
 * и ловиться должны все написания разом.
 */
const labelKeyWords = (key: string): string[] =>
    key
        .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
        .toLowerCase()
        .split(/[._\-\s]+/)
        .filter(Boolean);

/**
 * Слова, которые ловим И ВНУТРИ слитного ключа. Разбор по словам бессилен там,
 * где разделителей нет вовсе: `userid`, `dealid`, `phonenumber`, `clientname`
 * — это одно слово в нижнем регистре, и белый список их пропускал.
 *
 * Список намеренно уже, чем FORBIDDEN_LABEL_WORDS: сюда взяты только длинные
 * и однозначные корни. Коротких (`id`, `ip`, `uid`) здесь нет — подстрока
 * `ip` нашлась бы в `recipient`, а `id` в `hidden`, и гард выбрасывал бы
 * законные события. Хвост `...id` ловится отдельным правилом ниже.
 */
const FORBIDDEN_LABEL_SUBSTRINGS: readonly string[] = [
    'user',
    'manager',
    'employee',
    'deal',
    'lead',
    'task',
    'company',
    'contact',
    'client',
    'activity',
    'element',
    'phone',
    'email',
    'login',
    'token',
    'session',
    'uuid',
    'guid',
];

/**
 * Хвост идентификатора в слитном ключе: `userid`, `dealids`, `elementid`.
 * Перед `id` требуется минимум две буквы — чтобы правило не сработало на
 * самом слове `id` (его ловит белый список) и на коротких `bid`/`sid`,
 * которых у нас нет.
 */
const ID_TAIL = /[a-z]{2,}ids?$/;

/** Метка с запрещённым ключом — верный признак утечки идентификатора. */
export const isForbiddenLabelKey = (key: string): boolean => {
    const words = labelKeyWords(key);
    if (words.some(word => FORBIDDEN_LABEL_WORDS.has(word))) return true;
    return words.some(
        word =>
            ID_TAIL.test(word) ||
            FORBIDDEN_LABEL_SUBSTRINGS.some(bad => word.includes(bad)),
    );
};

const LABEL_VALUE_MAX = 64;
const SAFE_LABEL_VALUE = /^[a-z0-9._:-]+$/i;

/**
 * Значение перечислимой метки: нормализуем регистр и форму, всё непонятное
 * схлопываем в `other`.
 */
export const sanitizeEnumLabelValue = (
    raw: unknown,
    allowed: readonly string[],
): string => {
    if (typeof raw !== 'string') return UNKNOWN_LABEL_VALUE;
    const value = raw.trim().toLowerCase();
    if (!value) return UNKNOWN_LABEL_VALUE;
    return allowed.includes(value) ? value : OTHER_LABEL_VALUE;
};

/**
 * Облачный портал Битрикс24: один поддомен + `bitrix24.<зона>`
 * (`april-garant.bitrix24.ru`, `demo.bitrix24.com`, `x.bitrix24.com.br`).
 * Все боевые порталы владельца — ровно такие, см. DOMAIN_OVERRIDES в
 * modules/app/consts/domain-config.ts.
 */
const CLOUD_PORTAL_DOMAIN =
    /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.bitrix24\.[a-z]{2,3}(?:\.[a-z]{2,3})?$/;

/**
 * Коробочные порталы — вписывать СЮДА руками, по одному, при подключении.
 * У коробки домен произвольный, угадать его нельзя, а пускать произвольный
 * домен в метку нельзя тем более (см. ниже). Пустой список — это не забытая
 * работа, а текущее положение дел: коробок у приложения нет.
 */
export const EXTRA_PORTAL_DOMAINS: ReadonlySet<string> = new Set<string>();

/** Домен похож на портал, за метку которого мы отвечаем. */
export const isKnownPortalDomain = (domain: string): boolean =>
    CLOUD_PORTAL_DOMAIN.test(domain) || EXTRA_PORTAL_DOMAINS.has(domain);

/**
 * Домен портала: схема и хвостовые слэши срезаются, точка обязательна — ровно
 * как в getCrmUrl. Мусор без точки стал бы отдельной серией «мусор», поэтому
 * он честно превращается в `unknown`.
 *
 * ПОЧЕМУ ПОСЛЕ НОРМАЛИЗАЦИИ ЕЩЁ И БЕЛЫЙ СПИСОК. Маршрут приёма отвечает
 * любому, кто до него дотянулся, и «любая строка с точкой» означала бы, что
 * одним скриптом в реестр заводится сколько угодно доменов — а серия в
 * prom-client не удаляется до рестарта процесса. Поэтому в метку попадает
 * только то, что похоже на портал Битрикса; всё остальное честно ложится в
 * `other` — общей кучей, без единой новой серии. Отличие от `unknown`
 * содержательное: `unknown` — «домена не прислали», `other` — «прислали не
 * наш».
 */
export const sanitizeDomainLabel = (raw: unknown): string => {
    if (typeof raw !== 'string') return UNKNOWN_LABEL_VALUE;
    const value = raw
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/\/+$/, '')
        .slice(0, LABEL_VALUE_MAX);
    if (!value.includes('.')) return UNKNOWN_LABEL_VALUE;
    if (!SAFE_LABEL_VALUE.test(value)) return UNKNOWN_LABEL_VALUE;
    return isKnownPortalDomain(value) ? value : OTHER_LABEL_VALUE;
};

/** Спека метрики по имени; неизвестное имя — null (событие отбрасывается). */
export const findMetricSpec = (name: unknown): MetricSpec | null => {
    if (typeof name !== 'string') return null;
    return Object.prototype.hasOwnProperty.call(METRIC_SPECS, name)
        ? METRIC_SPECS[name as MetricName]
        : null;
};
