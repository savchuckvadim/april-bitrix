import { describe, expect, it } from 'vitest';

import {
    OUTBOX_DELIVERY_PHASE,
    outboxActions,
    outboxReducer,
} from './OutboxSlice';

/**
 * Зеркало outbox для UI: счётчики недоставленных (в том числе ждущих
 * досылки и проведённых не целиком) и признак «прогон дренажа идёт».
 * Источник правды — хранилище; сюда пишут только thunk'и слайса.
 */

const initial = outboxReducer(undefined, { type: '@@init' });

describe('OutboxSlice: счётчики зеркала', () => {
    it('на старте молчит: нулевые счётчики, домен неизвестен, прогона нет', () => {
        expect(initial).toEqual({
            undeliveredCount: 0,
            partialCount: 0,
            incompleteCount: 0,
            countedDomain: null,
            current: null,
            draining: false,
        });
    });

    it('setUndelivered кладёт все три счётчика и домен', () => {
        const state = outboxReducer(
            initial,
            outboxActions.setUndelivered({
                domain: 'a.bitrix24.ru',
                count: 3,
                partialCount: 1,
                incompleteCount: 2,
            }),
        );

        expect(state).toMatchObject({
            countedDomain: 'a.bitrix24.ru',
            undeliveredCount: 3,
            partialCount: 1,
            incompleteCount: 2,
        });
    });

    it('необязательные счётчики без значения — ноль, а не прошлое число', () => {
        const filled = outboxReducer(
            initial,
            outboxActions.setUndelivered({
                domain: 'a.bitrix24.ru',
                count: 2,
                partialCount: 2,
                incompleteCount: 1,
            }),
        );
        const state = outboxReducer(
            filled,
            outboxActions.setUndelivered({
                domain: 'a.bitrix24.ru',
                count: 1,
            }),
        );

        expect(state.partialCount).toBe(0);
        expect(state.incompleteCount).toBe(0);
        expect(state.undeliveredCount).toBe(1);
    });
});

describe('OutboxSlice: признак «прогон дренажа идёт»', () => {
    it('взводится и снимается', () => {
        const running = outboxReducer(initial, outboxActions.setDraining(true));

        expect(running.draining).toBe(true);
        expect(
            outboxReducer(running, outboxActions.setDraining(false)).draining,
        ).toBe(false);
    });

    it('счётчики прогоном не трогаются — они приходят своим экшеном', () => {
        const counted = outboxReducer(
            initial,
            outboxActions.setUndelivered({ domain: 'a', count: 2 }),
        );
        const running = outboxReducer(counted, outboxActions.setDraining(true));

        expect(running.undeliveredCount).toBe(2);
        expect(running.countedDomain).toBe('a');
    });
});

describe('OutboxSlice: текущая отправка', () => {
    it('стадия ставится и снимается только своей операцией', () => {
        const withCurrent = outboxReducer(
            initial,
            outboxActions.setCurrentDelivery({
                operationId: 'op-1',
                phase: OUTBOX_DELIVERY_PHASE.DELIVERING,
            }),
        );

        expect(withCurrent.current).toEqual({
            operationId: 'op-1',
            phase: OUTBOX_DELIVERY_PHASE.DELIVERING,
        });

        const foreign = outboxReducer(
            withCurrent,
            outboxActions.clearCurrentDelivery({ operationId: 'op-2' }),
        );

        expect(foreign.current).not.toBeNull();
        expect(
            outboxReducer(
                withCurrent,
                outboxActions.clearCurrentDelivery({ operationId: 'op-1' }),
            ).current,
        ).toBeNull();
    });

    it('reset возвращает молчание', () => {
        const dirty = outboxReducer(
            outboxReducer(initial, outboxActions.setDraining(true)),
            outboxActions.setUndelivered({ domain: 'a', count: 5 }),
        );

        expect(outboxReducer(dirty, outboxActions.reset())).toEqual(initial);
    });
});
