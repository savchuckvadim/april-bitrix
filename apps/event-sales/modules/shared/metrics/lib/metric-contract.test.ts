import { describe, expect, it } from 'vitest';

// Только типы: слои выше `shared` в рантайме сюда не тянутся, а тайпчек
// всё равно ловит расхождение списков.
import type { BootPhase } from '@/modules/app/lib/diagnostics/boot-phases';
import type { QuestionnaireChannel } from '@/modules/entities/Questionnaire/model/questionnaire.type';
import type { HiddenChecklistReason } from '@/modules/features/CallChecklist/lib/checklist-values';
import type {
    OutboxDeliveryOutcome,
    OutboxEnvelopeKind,
} from '@/modules/processes/event-outbox/lib/outbox-envelope';

import { METRIC, METRIC_BATCH_VERSION } from '../model/metric-event.type';
import {
    BOOT_PHASE_VALUES,
    DELIVERY_ATTEMPT_OUTCOME_VALUES,
    DELIVERY_TARGET_OUTCOME_VALUES,
    DOMAIN_LABEL,
    HIDDEN_QUESTION_REASON_VALUES,
    MAX_BODY_BYTES,
    MAX_EVENTS_PER_BATCH,
    METRIC_SPECS,
    OTHER_LABEL_VALUE,
    QUESTION_CHANNEL_VALUES,
    REPORT_OUTCOME_VALUES,
    SEND_KIND_VALUES,
    UNKNOWN_LABEL_VALUE,
    findMetricSpec,
    isForbiddenLabelKey,
    sanitizeDomainLabel,
    sanitizeEnumLabelValue,
} from './metric-contract';

/**
 * Контракт метрик. Половина проверок здесь — компиляторные: списки значений
 * меток дублируют перечисления бизнес-кода, и молча разошедшийся список
 * означал бы, что новая фаза бута или новый исход доставки попадают в `other`
 * и на графике их нет. Тайпчек (`tsc --noEmit`) ловит это на месте.
 */

type Exact<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
const assertExact = <T extends true>(): void => undefined;

assertExact<Exact<BootPhase, (typeof BOOT_PHASE_VALUES)[number]>>();
/**
 * Исходы обращения к цели — зеркало движка МИНУС `unavailable`: его счётчик
 * попыток не пишет вовсе (см. deliverToTarget), и в белом списке он был
 * мёртвым значением. Дрейф в остальном ловится по-прежнему: новый исход
 * движка без нового значения метки не скомпилируется.
 */
assertExact<
    Exact<
        Exclude<OutboxDeliveryOutcome, 'unavailable'>,
        (typeof DELIVERY_TARGET_OUTCOME_VALUES)[number]
    >
>();
assertExact<
    Exact<QuestionnaireChannel, (typeof QUESTION_CHANNEL_VALUES)[number]>
>();
assertExact<Exact<OutboxEnvelopeKind, (typeof SEND_KIND_VALUES)[number]>>();
// Причины «вопрос не показался» — зеркало веток резолва анкеты: новая ветка
// без нового значения метки означала бы спрятанный вопрос с причиной `other`.
assertExact<
    Exact<HiddenChecklistReason, (typeof HIDDEN_QUESTION_REASON_VALUES)[number]>
>();

describe('запрет идентификаторов в метках', () => {
    it('ловит всё, чем можно опознать человека, сделку или задачу', () => {
        expect(isForbiddenLabelKey('userId')).toBe(true);
        expect(isForbiddenLabelKey('user_id')).toBe(true);
        expect(isForbiddenLabelKey('dealId')).toBe(true);
        expect(isForbiddenLabelKey('taskId')).toBe(true);
        expect(isForbiddenLabelKey('managerName')).toBe(true);
        expect(isForbiddenLabelKey('phone')).toBe(true);
        expect(isForbiddenLabelKey('email')).toBe(true);
        expect(isForbiddenLabelKey('id')).toBe(true);
    });

    /**
     * РЕГРЕССИЯ (m3 из разбора): разбор ключа по словам бессилен там, где
     * разделителей нет вовсе. `userid` — одно слово в нижнем регистре:
     * camelCase-правило не срабатывает, точек и подчёркиваний нет, и белый
     * список пропускал ключ, ради которого весь гард и написан.
     */
    it('слитный ключ без разделителей тоже ловится', () => {
        expect(isForbiddenLabelKey('userid')).toBe(true);
        expect(isForbiddenLabelKey('dealid')).toBe(true);
        expect(isForbiddenLabelKey('taskid')).toBe(true);
        expect(isForbiddenLabelKey('phonenumber')).toBe(true);
        expect(isForbiddenLabelKey('clientname')).toBe(true);
        expect(isForbiddenLabelKey('leadids')).toBe(true);
    });

    it('не мешает рабочим меткам контракта', () => {
        for (const key of ['phase', 'outcome', 'target', 'state', 'reason']) {
            expect(isForbiddenLabelKey(key)).toBe(false);
        }
        expect(isForbiddenLabelKey('channel')).toBe(false);
        expect(isForbiddenLabelKey('kind')).toBe(false);
        expect(isForbiddenLabelKey(DOMAIN_LABEL)).toBe(false);
    });

    it('ни одна спека не объявляет запрещённую метку', () => {
        for (const spec of Object.values(METRIC_SPECS)) {
            for (const label of spec.labels) {
                expect(isForbiddenLabelKey(label)).toBe(false);
            }
        }
    });

    it('у каждой объявленной метки описаны допустимые значения', () => {
        for (const spec of Object.values(METRIC_SPECS)) {
            for (const label of spec.labels) {
                expect(Object.keys(spec.values)).toContain(label);
            }
        }
    });
});

describe('значения перечислимых меток', () => {
    it('известное проходит, регистр и пробелы нормализуются', () => {
        expect(sanitizeEnumLabelValue('report', SEND_KIND_VALUES)).toBe(
            'report',
        );
        expect(sanitizeEnumLabelValue('  NoCall ', SEND_KIND_VALUES)).toBe(
            'nocall',
        );
    });

    it('неизвестное схлопывается в other, а не теряется', () => {
        expect(sanitizeEnumLabelValue('letter', SEND_KIND_VALUES)).toBe(
            OTHER_LABEL_VALUE,
        );
    });

    it('пусто и не-строка — unknown', () => {
        expect(sanitizeEnumLabelValue('', SEND_KIND_VALUES)).toBe(
            UNKNOWN_LABEL_VALUE,
        );
        expect(sanitizeEnumLabelValue(undefined, SEND_KIND_VALUES)).toBe(
            UNKNOWN_LABEL_VALUE,
        );
        expect(sanitizeEnumLabelValue(7, SEND_KIND_VALUES)).toBe(
            UNKNOWN_LABEL_VALUE,
        );
    });
});

describe('домен портала', () => {
    it('срезает схему и хвостовые слэши', () => {
        expect(sanitizeDomainLabel('https://April.bitrix24.ru/')).toBe(
            'april.bitrix24.ru',
        );
    });

    it('без точки это не домен — unknown', () => {
        expect(sanitizeDomainLabel('localhost')).toBe(UNKNOWN_LABEL_VALUE);
        expect(sanitizeDomainLabel('')).toBe(UNKNOWN_LABEL_VALUE);
        expect(sanitizeDomainLabel(null)).toBe(UNKNOWN_LABEL_VALUE);
    });

    it('мусор с посторонними символами не заводит серию', () => {
        expect(sanitizeDomainLabel('a.b c/d?e=1')).toBe(UNKNOWN_LABEL_VALUE);
    });

    /**
     * РЕГРЕССИЯ (M1 из разбора): раньше в метку проходила ЛЮБАЯ строка с
     * точкой из безопасных символов. Маршрут приёма открыт, серия в
     * prom-client не удаляется до рестарта — значит одним скриптом в реестр
     * заводилось сколько угодно доменов. Теперь метку получает только то, что
     * похоже на портал Битрикса; остальное ложится в `other` общей кучей.
     */
    it('чужой домен не заводит серию, а ложится в other', () => {
        expect(sanitizeDomainLabel('evil.example.com')).toBe(OTHER_LABEL_VALUE);
        expect(sanitizeDomainLabel('a1.attacker.io')).toBe(OTHER_LABEL_VALUE);
        expect(sanitizeDomainLabel('bitrix24.ru')).toBe(OTHER_LABEL_VALUE);
        expect(sanitizeDomainLabel('portal.bitrix24.ru.evil.com')).toBe(
            OTHER_LABEL_VALUE,
        );
    });

    it('боевые порталы проходят как есть', () => {
        for (const domain of [
            'april-garant.bitrix24.ru',
            'gsr.bitrix24.ru',
            'garantservisvoronezh.bitrix24.ru',
            'demo.bitrix24.com',
        ]) {
            expect(sanitizeDomainLabel(domain)).toBe(domain);
        }
    });
});

describe('потолок тела пачки', () => {
    /**
     * РЕГРЕССИЯ (m2 из разбора): потолок тела на маршруте (32 КБ) был МЕНЬШЕ
     * того, что физически шлёт клиент (200 событий). Маршрут отвечал 413, а
     * клиент чистит буфер до отправки — пачка терялась целиком. Два числа
     * обязаны сходиться, и проверять это должен тест, а не прод.
     */
    it('полная пачка самых длинных событий влезает в MAX_BODY_BYTES', () => {
        const domain = `${'a'.repeat(51)}.bitrix24.ru`;
        const events = Array.from({ length: MAX_EVENTS_PER_BATCH }, () => ({
            name: METRIC.checklistQuestionHidden,
            labels: {
                reason: 'field-not-in-portal',
                channel: 'smart',
                domain,
            },
            value: 1,
        }));
        const body = JSON.stringify({ v: METRIC_BATCH_VERSION, events });

        expect(Buffer.byteLength(body, 'utf8')).toBeLessThan(MAX_BODY_BYTES);
    });
});

describe('попытки против судьбы отчёта', () => {
    /**
     * РЕГРЕССИЯ (M9 из разбора): один счётчик назывался «судьбой отчёта», а
     * считал попытки. Разделение обязано быть видно и в контракте: у метрик
     * разные имена, разные наборы значений и разный help — иначе владелец
     * снова возьмёт частоту ретраев за долю доставленных.
     */
    it('это две РАЗНЫЕ метрики с разными наборами исходов', () => {
        expect(METRIC.deliveryAttempt).not.toBe(METRIC.reportOutcome);
        expect(METRIC_SPECS[METRIC.deliveryAttempt].values.outcome).toBe(
            DELIVERY_ATTEMPT_OUTCOME_VALUES,
        );
        expect(METRIC_SPECS[METRIC.reportOutcome].values.outcome).toBe(
            REPORT_OUTCOME_VALUES,
        );
    });

    it('help попыток прямо запрещает считать по ним долю успеха', () => {
        const help = METRIC_SPECS[METRIC.deliveryAttempt].help;

        expect(help).toContain('ПОПЫТКИ');
        expect(help).toContain('ретраи');
        expect(help).toContain(METRIC.reportOutcome);
    });

    /**
     * `accepted` — «бэк взял операцию», а не «отчёт проведён»: настоящий
     * исход приходит поллингом статуса позже. Попади он в терминальные, доля
     * успеха снова врала бы в сторону «всё хорошо».
     */
    it('accepted терминальным исходом не считается', () => {
        expect(REPORT_OUTCOME_VALUES).not.toContain('accepted');
        expect(REPORT_OUTCOME_VALUES).toContain('delivered');
        expect(REPORT_OUTCOME_VALUES).toContain('stuck');
    });

    /**
     * РЕГРЕССИЯ (мелочь из разбора): `unavailable` в белом списке никогда не
     * писался сознательно — мёртвое значение, которое стоило пары серий на
     * каждую цель и каждый портал.
     */
    it('мёртвого значения unavailable в белом списке нет', () => {
        expect(DELIVERY_ATTEMPT_OUTCOME_VALUES).not.toContain('unavailable');
        expect(
            sanitizeEnumLabelValue(
                'unavailable',
                DELIVERY_ATTEMPT_OUTCOME_VALUES,
            ),
        ).toBe(OTHER_LABEL_VALUE);
    });

    /** Сверка статуса, не давшая ответа, — тоже попытка сдвинуть конверт. */
    it('несостоявшаяся сверка статуса дренажа считается попыткой', () => {
        expect(DELIVERY_ATTEMPT_OUTCOME_VALUES).toContain('status-unavailable');
    });
});

describe('help метрик бута', () => {
    /**
     * РЕГРЕССИЯ (мелочь из разбора): формулировки говорили «от начала
     * инициализации», хотя отсчёт идёт ОТ НАВИГАЦИИ документа (см.
     * boot-metrics.ts) — то есть включает TTFB, бандл и гидрацию. Владелец
     * читал бы с графика меньшее число, чем ждёт менеджер.
     */
    it('считают от навигации документа, а не от начала инициализации', () => {
        for (const name of [METRIC.bootPhase, METRIC.bootToTasks]) {
            expect(METRIC_SPECS[name].help).toContain('навигаци');
            expect(METRIC_SPECS[name].help).not.toContain('инициализации');
        }
    });
});

describe('поиск спеки', () => {
    it('неизвестное имя метрики — null', () => {
        expect(findMetricSpec('whatever_total')).toBeNull();
        expect(findMetricSpec(42)).toBeNull();
    });

    it('свойства прототипа именами метрик не считаются', () => {
        expect(findMetricSpec('toString')).toBeNull();
        expect(findMetricSpec('constructor')).toBeNull();
    });
});
