import { describe, expect, it } from 'vitest';

import { METRIC, METRIC_BATCH_VERSION } from '../model/metric-event.type';
import {
    MAX_ENVELOPES_VALUE,
    MAX_EVENTS_PER_BATCH,
    MAX_METRIC_VALUE,
    MAX_SECONDS_VALUE,
    METRIC_SPECS,
    OTHER_LABEL_VALUE,
    UNKNOWN_LABEL_VALUE,
} from './metric-contract';
import {
    parseMetricBatch,
    serializeMetricBatch,
    serializeMetricEvent,
} from './serialize-metric-event';

/**
 * Сериализация события метрики — единственный гард на обе стороны провода:
 * через неё проходит и то, что браузер собирается послать, и то, что маршрут
 * приёма получил. Всё чистое, ни сети, ни времени.
 */

const DOMAIN = 'april.bitrix24.ru';

describe('счётчик', () => {
    it('без значения — это +1, метки заполняются по спеке', () => {
        expect(
            serializeMetricEvent({
                name: METRIC.send,
                labels: { kind: 'report', domain: DOMAIN },
            }),
        ).toEqual({
            name: METRIC.send,
            labels: { kind: 'report', domain: DOMAIN },
            value: 1,
        });
    });

    it('пропущенная метка становится unknown, а не пустой строкой', () => {
        const event = serializeMetricEvent({ name: METRIC.send });
        expect(event?.labels).toEqual({
            kind: UNKNOWN_LABEL_VALUE,
            domain: UNKNOWN_LABEL_VALUE,
        });
    });

    it('ноль и минус не записываем — это не приращение', () => {
        expect(
            serializeMetricEvent({ name: METRIC.send, value: 0 }),
        ).toBeNull();
        expect(
            serializeMetricEvent({ name: METRIC.send, value: -3 }),
        ).toBeNull();
    });

    it('огромное значение подрезается потолком', () => {
        expect(
            serializeMetricEvent({ name: METRIC.send, value: 1e300 })?.value,
        ).toBe(MAX_METRIC_VALUE);
    });
});

/**
 * РЕГРЕССИЯ (M3 из разбора): потолок был ОДИН на все метрики — миллион. Для
 * счётчика это нормально, а для гистограммы в секундах — дыра: наблюдение в
 * миллион уходит в `_sum`, и средняя первая загрузка `rate(_sum)/rate(_count)`
 * остаётся испорченной до рестарта процесса. Одной анонимной пачки хватало,
 * чтобы навсегда сломать главную цифру владельца.
 */
describe('потолок значения задан поспековно', () => {
    it('секунды режутся по потолку секунд, а не по миллиону', () => {
        expect(
            serializeMetricEvent({
                name: METRIC.bootToTasks,
                labels: { domain: DOMAIN },
                value: MAX_METRIC_VALUE,
            })?.value,
        ).toBe(MAX_SECONDS_VALUE);
        expect(
            serializeMetricEvent({
                name: METRIC.bootPhase,
                labels: { phase: 'splash-off', domain: DOMAIN },
                value: 1e300,
            })?.value,
        ).toBe(MAX_SECONDS_VALUE);
    });

    it('законное наблюдение ниже потолка не трогается', () => {
        expect(
            serializeMetricEvent({
                name: METRIC.bootToTasks,
                labels: { domain: DOMAIN },
                value: 62.5,
            })?.value,
        ).toBe(62.5);
    });

    it('уровень конвертов режется тысячами, а не миллионом', () => {
        expect(
            serializeMetricEvent({
                name: METRIC.outboxBacklog,
                labels: { state: 'undelivered', domain: DOMAIN },
                value: MAX_METRIC_VALUE,
            })?.value,
        ).toBe(MAX_ENVELOPES_VALUE);
    });

    it('счётчикам общий потолок оставлен', () => {
        const counters = [
            METRIC.send,
            METRIC.deliveryAttempt,
            METRIC.reportOutcome,
            METRIC.checklistQuestionHidden,
        ] as const;

        for (const name of counters) {
            expect(METRIC_SPECS[name].maxValue).toBe(MAX_METRIC_VALUE);
        }
    });
});

describe('гистограмма и gauge', () => {
    it('гистограмма без значения не наблюдение — null', () => {
        expect(
            serializeMetricEvent({
                name: METRIC.bootToTasks,
                labels: { domain: DOMAIN },
            }),
        ).toBeNull();
    });

    it('фаза бута пишется со значением в секундах', () => {
        expect(
            serializeMetricEvent({
                name: METRIC.bootPhase,
                labels: { phase: 'tasks-fetched', domain: DOMAIN },
                value: 2.4,
            }),
        ).toEqual({
            name: METRIC.bootPhase,
            labels: { phase: 'tasks-fetched', domain: DOMAIN },
            value: 2.4,
        });
    });

    it('gauge принимает ноль: «ничего не осталось» — тоже уровень', () => {
        expect(
            serializeMetricEvent({
                name: METRIC.outboxBacklog,
                labels: { state: 'undelivered', domain: DOMAIN },
                value: 0,
            })?.value,
        ).toBe(0);
    });

    it('отрицательное время — сломанные часы, а не замер', () => {
        expect(
            serializeMetricEvent({
                name: METRIC.bootToTasks,
                labels: { domain: DOMAIN },
                value: -1,
            }),
        ).toBeNull();
    });
});

describe('что отбрасывается', () => {
    it('неизвестное имя метрики', () => {
        expect(
            serializeMetricEvent({ name: 'event_sales_made_up_total' }),
        ).toBeNull();
    });

    it('не объект', () => {
        expect(serializeMetricEvent(null)).toBeNull();
        expect(serializeMetricEvent('event_sales_send_total')).toBeNull();
        expect(serializeMetricEvent([{ name: METRIC.send }])).toBeNull();
    });

    it('лишняя метка не попадает в серию', () => {
        const event = serializeMetricEvent({
            name: METRIC.send,
            labels: { kind: 'report', domain: DOMAIN, stage: 'whatever' },
        });
        expect(event?.labels).toEqual({ kind: 'report', domain: DOMAIN });
        expect(event?.labels).not.toHaveProperty('stage');
    });

    it('идентификатор в метке выбрасывает событие ЦЕЛИКОМ', () => {
        for (const leak of ['userId', 'dealId', 'taskId', 'managerName']) {
            expect(
                serializeMetricEvent({
                    name: METRIC.send,
                    labels: { kind: 'report', domain: DOMAIN, [leak]: '17' },
                }),
            ).toBeNull();
        }
    });

    it('неизвестное значение метки схлопывается, событие живёт', () => {
        const event = serializeMetricEvent({
            name: METRIC.deliveryAttempt,
            labels: { outcome: 'teleported', target: 'moon', domain: DOMAIN },
        });
        expect(event?.labels).toEqual({
            outcome: OTHER_LABEL_VALUE,
            target: OTHER_LABEL_VALUE,
            domain: DOMAIN,
        });
    });
});

describe('пачка', () => {
    const valid = { name: METRIC.send, labels: { kind: 'nocall' } };

    it('мусор внутри пачки не мешает остальным', () => {
        const body = serializeMetricBatch([
            valid,
            { name: 'nope_total' },
            null,
            valid,
        ]);
        expect(body.v).toBe(METRIC_BATCH_VERSION);
        expect(body.events).toHaveLength(2);
    });

    it('число событий ограничено потолком', () => {
        const body = serializeMetricBatch(
            Array.from({ length: MAX_EVENTS_PER_BATCH + 50 }, () => valid),
        );
        expect(body.events).toHaveLength(MAX_EVENTS_PER_BATCH);
    });

    it('разбор тела: чужая версия и кривая форма дают пусто', () => {
        expect(parseMetricBatch({ v: 99, events: [valid] })).toEqual([]);
        expect(parseMetricBatch({ v: METRIC_BATCH_VERSION })).toEqual([]);
        expect(parseMetricBatch([valid])).toEqual([]);
        expect(parseMetricBatch('nope')).toEqual([]);
        expect(parseMetricBatch(null)).toEqual([]);
    });

    it('разбор тела: своя версия пропускает нормальные события', () => {
        expect(
            parseMetricBatch({ v: METRIC_BATCH_VERSION, events: [valid] }),
        ).toHaveLength(1);
    });
});
