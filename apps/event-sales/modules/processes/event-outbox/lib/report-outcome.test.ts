import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
    OUTBOX_ENVELOPE_STATE,
    mergeRequeuedEnvelope,
} from './outbox-envelope';
import {
    isReportOutcomeCounted,
    markDirectExecutionOutcome,
    markReportOutcome,
} from './report-outcome';
import { TEST_DOMAIN, makeEnvelope } from './outbox-test-kit';

/**
 * Отметка «терминальный исход посчитан» — единственный механизм, который
 * держит правило «ровно один инкремент на конверт» там, где гварды состояния
 * бессильны: повторный прогон дренажа по тому же застрявшему конверту,
 * соседняя вкладка, новая сессия после перезагрузки фрейма. Все они читают
 * конверт из одного хранилища, поэтому отметка живёт в конверте.
 */

const collected = vi.hoisted(() => ({
    outcomes: [] as Array<{ outcome: string; domain?: string | null }>,
}));

vi.mock('@/modules/shared/metrics/lib/business-metrics', () => ({
    countReportOutcome: (params: { outcome: string; domain?: string }) => {
        collected.outcomes.push(params);
    },
    countDeliveryAttempt: () => undefined,
    countSend: () => undefined,
    countHiddenChecklistQuestion: () => undefined,
    observeBootPhase: () => undefined,
    observeBootToTasks: () => undefined,
    publishOutboxLevel: () => undefined,
}));

beforeEach(() => {
    collected.outcomes.length = 0;
});

describe('markReportOutcome', () => {
    it('считает исход один раз и оставляет отметку в конверте', () => {
        const marked = markReportOutcome(makeEnvelope(), 'delivered');

        expect(collected.outcomes).toEqual([
            { outcome: 'delivered', domain: TEST_DOMAIN },
        ]);
        expect(isReportOutcomeCounted(marked)).toBe(true);
    });

    it('уже посчитанный конверт не считается второй раз НИ ПОД КАКИМ исходом', () => {
        const marked = markReportOutcome(makeEnvelope(), 'delivered');

        // Опоздавший провал из второй дороги (поллинг против дренажа) или
        // повторный прогон по тому же конверту.
        const again = markReportOutcome(marked, 'rejected');
        const third = markReportOutcome(again, 'stuck');

        expect(collected.outcomes).toEqual([
            { outcome: 'delivered', domain: TEST_DOMAIN },
        ]);
        expect(third).toBe(marked);
    });

    it('исходный конверт не мутируется — отметка возвращается копией', () => {
        const envelope = makeEnvelope();

        markReportOutcome(envelope, 'delivered');

        expect(envelope.outcomeCounted).toBeUndefined();
    });
});

describe('прямое исполнение: delivered — терминал, partial — ещё нет', () => {
    it('пустой хвост закрывает отчёт: считаем «проведён»', () => {
        const marked = markDirectExecutionOutcome(
            makeEnvelope({ state: OUTBOX_ENVELOPE_STATE.delivered }),
        );

        expect(collected.outcomes).toEqual([
            { outcome: 'delivered', domain: TEST_DOMAIN },
        ]);
        expect(isReportOutcomeCounted(marked)).toBe(true);
    });

    it('partial ждёт досылки хвоста — исхода у него ещё нет', () => {
        const envelope = markDirectExecutionOutcome(
            makeEnvelope({ state: OUTBOX_ENVELOPE_STATE.partial }),
        );

        // Записать такой отчёт в успех значило бы объявить проведённым то,
        // у чего нет ни KPI, ни движений сделок, ни элементов смартов.
        expect(collected.outcomes).toEqual([]);
        expect(isReportOutcomeCounted(envelope)).toBe(false);
    });
});

describe('«Повторить» — новая отправка, значит и новый исход', () => {
    /**
     * `event_sales_send_total` считает повтор кнопкой наравне с первой
     * отправкой. Перенеси mergeRequeuedEnvelope отметку — у повторов исходов
     * не было бы вовсе, и воронка «начато против закончено» показывала бы
     * вечную потерю на каждом ручном повторе.
     */
    it('повторный enqueue сбрасывает отметку — у повтора будет своя судьба', () => {
        const rejected = markReportOutcome(
            makeEnvelope({ state: OUTBOX_ENVELOPE_STATE.failed }),
            'rejected',
        );
        const fresh = makeEnvelope({ operationId: rejected.operationId });
        const merged = mergeRequeuedEnvelope(rejected, fresh);

        expect(isReportOutcomeCounted(merged)).toBe(false);

        markReportOutcome(merged, 'delivered');

        expect(collected.outcomes.map(item => item.outcome)).toEqual([
            'rejected',
            'delivered',
        ]);
    });

    /**
     * Исключение: конверт, чьё ядро уже исполнено НАПРЯМУЮ, повторному
     * enqueue не поддаётся вовсе (mergeRequeuedEnvelope возвращает его как
     * есть) — значит и отметка остаётся, второй судьбы у него не будет.
     */
    it('конверт с прямым исполнением повтором не сбрасывается', () => {
        const executed = markReportOutcome(
            makeEnvelope({
                state: OUTBOX_ENVELOPE_STATE.delivered,
                executedDirect: true,
            }),
            'delivered',
        );
        const merged = mergeRequeuedEnvelope(
            executed,
            makeEnvelope({ operationId: executed.operationId }),
        );

        expect(isReportOutcomeCounted(merged)).toBe(true);
        markReportOutcome(merged, 'delivered');
        expect(collected.outcomes).toHaveLength(1);
    });
});
