import { describe, expect, it } from 'vitest';

import { METRIC, type MetricBatchBody } from '../model/metric-event.type';
import {
    countDeliveryAttempt,
    countHiddenChecklistQuestion,
    countReportOutcome,
    countSend,
    observeBootPhase,
    observeBootToTasks,
    publishOutboxLevel,
} from './business-metrics';
import { createMetricsClient } from './metrics-client';

/**
 * Прослойка врезок: имя метрики и метки собираются здесь, и ошибиться в них
 * должен тест, а не дашборд. Плюс главное свойство всего захода — при
 * выключенном сборе не происходит НИЧЕГО.
 */

const collector = () => {
    const sent: MetricBatchBody[] = [];
    const client = createMetricsClient({ send: body => sent.push(body) });
    const drain = () => {
        client.flush();
        return sent.flatMap(body => body.events);
    };
    return { client, drain };
};

describe('врезки собирают правильные метрики', () => {
    it('фаза бута — гистограмма в секундах с меткой фазы и домена', () => {
        const { client, drain } = collector();
        observeBootPhase(
            { phase: 'tasks-fetched', seconds: 2.5, domain: 'a.bitrix24.ru' },
            client,
        );

        expect(drain()).toEqual([
            {
                name: METRIC.bootPhase,
                labels: { phase: 'tasks-fetched', domain: 'a.bitrix24.ru' },
                value: 2.5,
            },
        ]);
    });

    it('первая загрузка целиком — отдельная метрика без метки фазы', () => {
        const { client, drain } = collector();
        observeBootToTasks({ seconds: 3, domain: 'a.bitrix24.ru' }, client);

        expect(drain()).toEqual([
            {
                name: METRIC.bootToTasks,
                labels: { domain: 'a.bitrix24.ru' },
                value: 3,
            },
        ]);
    });

    it('попытка доставки — счётчик с исходом и целью, приращение 1', () => {
        const { client, drain } = collector();
        countDeliveryAttempt(
            {
                outcome: 'executed-direct',
                target: 'direct-bitrix',
                domain: 'a.bitrix24.ru',
            },
            client,
        );

        expect(drain()).toEqual([
            {
                name: METRIC.deliveryAttempt,
                labels: {
                    outcome: 'executed-direct',
                    target: 'direct-bitrix',
                    domain: 'a.bitrix24.ru',
                },
                value: 1,
            },
        ]);
    });

    it('судьба отчёта — счётчик без метки цели: это исход конверта, а не попытки', () => {
        const { client, drain } = collector();
        countReportOutcome(
            { outcome: 'delivered', domain: 'a.bitrix24.ru' },
            client,
        );

        expect(drain()).toEqual([
            {
                name: METRIC.reportOutcome,
                labels: { outcome: 'delivered', domain: 'a.bitrix24.ru' },
                value: 1,
            },
        ]);
    });

    it('уровень конвертов публикуется всеми тремя состояниями, включая нули', () => {
        const { client, drain } = collector();
        publishOutboxLevel(
            {
                domain: 'a.bitrix24.ru',
                undelivered: 2,
                partial: 0,
                incomplete: 1,
            },
            client,
        );

        // Ноль обязателен: без него gauge застыл бы на прошлом значении и
        // разъехавшаяся очередь выглядела бы вечно застрявшей.
        expect(drain()).toEqual([
            {
                name: METRIC.outboxBacklog,
                labels: { state: 'undelivered', domain: 'a.bitrix24.ru' },
                value: 2,
            },
            {
                name: METRIC.outboxBacklog,
                labels: { state: 'partial', domain: 'a.bitrix24.ru' },
                value: 0,
            },
            {
                name: METRIC.outboxBacklog,
                labels: { state: 'incomplete', domain: 'a.bitrix24.ru' },
                value: 1,
            },
        ]);
    });

    it('спрятанный вопрос — счётчик с причиной и каналом', () => {
        const { client, drain } = collector();
        countHiddenChecklistQuestion(
            {
                reason: 'field-not-in-portal',
                channel: 'crm',
                domain: 'a.bitrix24.ru',
            },
            client,
        );

        expect(drain()).toEqual([
            {
                name: METRIC.checklistQuestionHidden,
                labels: {
                    reason: 'field-not-in-portal',
                    channel: 'crm',
                    domain: 'a.bitrix24.ru',
                },
                value: 1,
            },
        ]);
    });

    it('отправка — счётчик с видом', () => {
        const { client, drain } = collector();
        countSend({ kind: 'nocall', domain: 'a.bitrix24.ru' }, client);

        expect(drain()).toEqual([
            {
                name: METRIC.send,
                labels: { kind: 'nocall', domain: 'a.bitrix24.ru' },
                value: 1,
            },
        ]);
    });

    it('домена нет — серия не плывёт, метка честно unknown', () => {
        const { client, drain } = collector();
        countSend({ kind: 'report' }, client);

        expect(drain()[0]?.labels).toEqual({
            kind: 'report',
            domain: 'unknown',
        });
    });
});

describe('при выключенных метриках не происходит НИЧЕГО', () => {
    it('ни одна врезка не копит событие и не порождает запрос', () => {
        const sent: MetricBatchBody[] = [];
        const client = createMetricsClient({
            send: body => sent.push(body),
            isEnabled: () => false,
        });

        observeBootPhase({ phase: 'init-start', seconds: 0 }, client);
        observeBootToTasks({ seconds: 1 }, client);
        countDeliveryAttempt(
            { outcome: 'accepted', target: 'primary-backend' },
            client,
        );
        countReportOutcome({ outcome: 'delivered' }, client);
        publishOutboxLevel(
            { undelivered: 3, partial: 1, incomplete: 1 },
            client,
        );
        countHiddenChecklistQuestion(
            { reason: 'no-carrier', channel: 'crm' },
            client,
        );
        countSend({ kind: 'report' }, client);

        expect(client.size()).toBe(0);
        client.flush();
        expect(sent).toHaveLength(0);
    });

    it('врезка не бросает даже с негодным транспортом', () => {
        const client = createMetricsClient({
            send: () => {
                throw new Error('маршрут недоступен');
            },
        });

        expect(() => countSend({ kind: 'report' }, client)).not.toThrow();
        expect(() => client.flush()).not.toThrow();
    });
});
