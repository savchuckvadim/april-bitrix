import { existsSync } from 'node:fs';
import path from 'node:path';

import { register as globalPromRegister } from 'prom-client';
import { describe, expect, it } from 'vitest';

import { MAX_SECONDS_VALUE } from '@/modules/shared/metrics/lib/metric-contract';
import { METRIC } from '@/modules/shared/metrics/model/metric-event.type';
import { serializeMetricEvent } from '@/modules/shared/metrics/lib/serialize-metric-event';

import {
    BOOT_BUCKETS,
    MAX_DOMAINS,
    capDomainValue,
    getBusinessMetrics,
    recordMetricEvent,
} from './registry';

/**
 * Реестр — последнее звено пути «браузер → маршрут приёма → Prometheus», и
 * единственное место, где видно, что метрика действительно превратилась в
 * строки экспозиции. Ошибка здесь (разъехавшийся набор меток, метрика не в
 * том реестре) не всплыла бы нигде, кроме прода.
 */

const DOMAIN = 'metrics-test.bitrix24.ru';

/** Через сериализатор — ровно так, как это делает маршрут приёма. */
const record = (raw: unknown): boolean => {
    const event = serializeMetricEvent(raw);
    expect(event).not.toBeNull();
    return recordMetricEvent(event!);
};

describe('экспозиция', () => {
    it('все семь бизнес-метрик доезжают до текста для Prometheus', async () => {
        expect(
            record({
                name: METRIC.bootToTasks,
                labels: { domain: DOMAIN },
                value: 2.5,
            }),
        ).toBe(true);
        expect(
            record({
                name: METRIC.bootPhase,
                labels: { phase: 'splash-off', domain: DOMAIN },
                value: 1.1,
            }),
        ).toBe(true);
        expect(
            record({
                name: METRIC.deliveryAttempt,
                labels: {
                    outcome: 'executed-direct',
                    target: 'direct-bitrix',
                    domain: DOMAIN,
                },
            }),
        ).toBe(true);
        expect(
            record({
                name: METRIC.reportOutcome,
                labels: { outcome: 'delivered', domain: DOMAIN },
            }),
        ).toBe(true);
        expect(
            record({
                name: METRIC.outboxBacklog,
                labels: { state: 'partial', domain: DOMAIN },
                value: 3,
            }),
        ).toBe(true);
        expect(
            record({
                name: METRIC.checklistQuestionHidden,
                labels: {
                    reason: 'no-carrier',
                    channel: 'crm',
                    domain: DOMAIN,
                },
            }),
        ).toBe(true);
        expect(record({ name: METRIC.send, labels: { kind: 'nocall' } })).toBe(
            true,
        );

        const text = await getBusinessMetrics().registry.metrics();

        expect(text).toContain(
            `event_sales_boot_to_tasks_seconds_sum{domain="${DOMAIN}"} 2.5`,
        );
        expect(text).toContain(
            `event_sales_boot_phase_seconds_count{phase="splash-off",domain="${DOMAIN}"} 1`,
        );
        expect(text).toContain(
            `event_sales_report_delivery_attempts_total{outcome="executed-direct",target="direct-bitrix",domain="${DOMAIN}"} 1`,
        );
        expect(text).toContain(
            `event_sales_report_outcome_total{outcome="delivered",domain="${DOMAIN}"} 1`,
        );
        expect(text).toContain(
            `event_sales_outbox_backlog_last_seen_envelopes{state="partial",domain="${DOMAIN}"} 3`,
        );
        expect(text).toContain(
            `event_sales_checklist_question_hidden_total{reason="no-carrier",channel="crm",domain="${DOMAIN}"} 1`,
        );
        expect(text).toContain('event_sales_send_total{kind="nocall"');
    });

    it('стандартные показатели процесса никуда не делись', async () => {
        const text = await getBusinessMetrics().registry.metrics();
        expect(text).toContain('process_cpu_user_seconds_total');
        expect(text).toContain('nodejs_eventloop_lag_seconds');
    });

    it('gauge переписывается, а не накапливается — это уровень', async () => {
        record({
            name: METRIC.outboxBacklog,
            labels: { state: 'undelivered', domain: DOMAIN },
            value: 7,
        });
        record({
            name: METRIC.outboxBacklog,
            labels: { state: 'undelivered', domain: DOMAIN },
            value: 2,
        });
        const text = await getBusinessMetrics().registry.metrics();
        expect(text).toContain(
            `event_sales_outbox_backlog_last_seen_envelopes{state="undelivered",domain="${DOMAIN}"} 2`,
        );
    });

    /**
     * РЕГРЕССИЯ (m7 из разбора): gauge остатка пишет КАЖДАЯ вкладка и каждый
     * экземпляр Next, а в серии остаётся замер последнего написавшего — ни
     * сумма, ни максимум. Имя `..._undelivered_envelopes` читалось как итог
     * по порталу, и владелец принимал бы за итог случайный замер одной
     * вкладки. Имя и help обязаны говорить это вслух.
     */
    it('имя и help gauge не обещают итога по порталу', async () => {
        const text = await getBusinessMetrics().registry.metrics();

        expect(METRIC.outboxBacklog).toContain('last_seen');
        expect(text).toContain(
            '# HELP event_sales_outbox_backlog_last_seen_envelopes',
        );
        const help = text
            .split('\n')
            .find(line =>
                line.startsWith(
                    '# HELP event_sales_outbox_backlog_last_seen_envelopes',
                ),
            );

        expect(help).toContain('ОДНОЙ вкладкой');
        expect(help).toContain('не итог по порталу');
    });

    /**
     * РЕГРЕССИЯ (M9 из разбора): счётчик попыток назывался «судьбой отчёта»,
     * а считал обращения к цели — с трёхкратным усилением от бэкоффа и
     * ещё трёхкратным на каждом прогоне дренажа. Владелец, считая по нему
     * долю доставленных, получал частоту ретраев. Имена и help обязаны
     * различать попытку и судьбу так, чтобы это читалось с графика.
     */
    it('попытки и судьба — разные метрики, и это видно по имени и help', async () => {
        const text = await getBusinessMetrics().registry.metrics();

        expect(METRIC.deliveryAttempt).toContain('attempts');
        expect(METRIC.reportOutcome).not.toContain('attempts');

        const helpOf = (name: string): string =>
            text.split('\n').find(line => line.startsWith(`# HELP ${name}`)) ??
            '';

        expect(helpOf(METRIC.deliveryAttempt)).toContain('ПОПЫТКИ');
        expect(helpOf(METRIC.deliveryAttempt)).toContain('ретраи');
        expect(helpOf(METRIC.reportOutcome)).toContain(
            'один терминальный исход на конверт',
        );
    });
});

describe('синглтон', () => {
    it('переживает повторное исполнение модуля (hot-reload в dev)', () => {
        // Именно это и ломало бы приложение без globalThis: prom-client
        // бросает на повторной регистрации метрики с тем же именем.
        expect(getBusinessMetrics()).toBe(getBusinessMetrics());
        expect(() => getBusinessMetrics()).not.toThrow();
    });
});

describe('потолок доменов', () => {
    it('новые домены за потолком схлопываются в other', () => {
        const seen = new Set<string>();
        expect(capDomainValue(seen, 'a.bitrix24.ru', 2)).toBe('a.bitrix24.ru');
        expect(capDomainValue(seen, 'b.bitrix24.ru', 2)).toBe('b.bitrix24.ru');
        expect(capDomainValue(seen, 'c.bitrix24.ru', 2)).toBe('other');
    });

    it('уже виденный портал проходит всегда, даже когда потолок выбран', () => {
        const seen = new Set(['a.bitrix24.ru', 'b.bitrix24.ru']);
        expect(capDomainValue(seen, 'a.bitrix24.ru', 2)).toBe('a.bitrix24.ru');
    });

    /**
     * РЕГРЕССИЯ (M1 из разбора): потолок стоял на 300. Метка домена
     * умножается на все остальные метки, и 300 доменов дают около 70 тысяч
     * временных рядов из одного процесса — ни один из них не удаляется до
     * рестарта, TTL у prom-client нет. Потолок обязан быть порядка числа
     * реальных порталов, то есть десятками.
     */
    it('потолок доменов — десятки, а не сотни', () => {
        expect(MAX_DOMAINS).toBeLessThanOrEqual(64);
        expect(MAX_DOMAINS).toBeGreaterThanOrEqual(10);
    });
});

describe('дрейф потолков и корзин', () => {
    /**
     * Потолок наблюдения в секундах объявлен в контракте (браузер), корзины
     * гистограмм — здесь (сервер). Разъехавшись, они дают либо подрезанные
     * законные наблюдения, либо снова испорченную `_sum`.
     */
    it('потолок секунд — ровно две верхних корзины', () => {
        expect(MAX_SECONDS_VALUE).toBe(Math.max(...BOOT_BUCKETS) * 2);
    });
});

describe('глобальный реестр prom-client', () => {
    /**
     * РЕГРЕССИЯ (m5 из разбора): рядом лежали мёртвые `metrics.ts` и
     * `withMetrics.ts`, регистрировавшие метрики в ГЛОБАЛЬНОМ реестре
     * prom-client прямо в теле модуля — ровно та мина, от которой registry.ts
     * защищается синглтоном на globalThis: первый же импорт уронил бы dev на
     * hot-reload повторной регистрацией. Потребителей у них не было; вернуть
     * их обратно тоже нельзя.
     */
    it('приложение в глобальный реестр не пишет и мёртвых модулей не держит', () => {
        expect(existsSync(path.join(__dirname, 'metrics.ts'))).toBe(false);
        expect(existsSync(path.join(__dirname, 'withMetrics.ts'))).toBe(false);
        expect(globalPromRegister.getMetricsAsArray()).toHaveLength(0);
    });
});
