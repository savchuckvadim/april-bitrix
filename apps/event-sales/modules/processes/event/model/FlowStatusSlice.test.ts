import { describe, expect, it } from 'vitest';

import {
    FLOW_OUTBOX_STATE,
    FLOW_STAGE,
    flowStatusActions,
    flowStatusReducer,
} from './FlowStatusSlice';

/**
 * Судьба конверта outbox поверх стадии HTTP: QUEUED ставится отдельным
 * экшеном, новая отправка и подтверждённый done её сбрасывают.
 */

const sending = () =>
    flowStatusReducer(
        undefined,
        flowStatusActions.setSending({
            startedAt: 1_000,
            result: '',
            operationId: 'op-1',
        }),
    );

describe('flowStatus × outbox', () => {
    it('setOutboxQueued: стадия остаётся SENDING, конверт — в очереди дренажа', () => {
        const state = flowStatusReducer(
            sending(),
            flowStatusActions.setOutboxQueued(),
        );

        expect(state.stage).toBe(FLOW_STAGE.SENDING);
        expect(state.outboxState).toBe(FLOW_OUTBOX_STATE.QUEUED);
    });

    it('setDeliveryTarget: цель доставки записана для финиш-стадий', () => {
        const state = flowStatusReducer(
            sending(),
            flowStatusActions.setDeliveryTarget({ target: 'primary-backend' }),
        );

        expect(state.deliveryTarget).toBe('primary-backend');
    });

    it('новая отправка сбрасывает судьбу конверта прошлой', () => {
        let state = flowStatusReducer(
            sending(),
            flowStatusActions.setOutboxQueued(),
        );

        state = flowStatusReducer(
            state,
            flowStatusActions.setDeliveryTarget({ target: 'primary-backend' }),
        );
        state = flowStatusReducer(
            state,
            flowStatusActions.setSending({
                startedAt: 2_000,
                result: '',
                operationId: 'op-2',
            }),
        );

        expect(state.outboxState).toBe(FLOW_OUTBOX_STATE.NONE);
        expect(state.deliveryTarget).toBeNull();
    });

    it('done закрывает историю «отправим автоматически» (дренаж доставил)', () => {
        let state = flowStatusReducer(
            sending(),
            flowStatusActions.setOutboxQueued(),
        );

        state = flowStatusReducer(
            state,
            flowStatusActions.setDone({ tasksStale: true }),
        );

        expect(state.stage).toBe(FLOW_STAGE.DONE);
        expect(state.outboxState).toBe(FLOW_OUTBOX_STATE.NONE);
    });
});

describe('flowStatus x direct (A4)', () => {
    it('setOutboxPartial ПОСЛЕ setDone: DONE+PARTIAL для финиша и баннера', () => {
        let state = flowStatusReducer(
            sending(),
            flowStatusActions.setDone({ tasksStale: true }),
        );

        state = flowStatusReducer(state, flowStatusActions.setOutboxPartial());

        expect(state.stage).toBe(FLOW_STAGE.DONE);
        expect(state.outboxState).toBe(FLOW_OUTBOX_STATE.PARTIAL);
        expect(state.isTasksStale).toBe(true);
    });

    it('новая отправка сбрасывает PARTIAL прошлой', () => {
        let state = flowStatusReducer(
            sending(),
            flowStatusActions.setDone({ tasksStale: true }),
        );

        state = flowStatusReducer(state, flowStatusActions.setOutboxPartial());
        state = flowStatusReducer(
            state,
            flowStatusActions.setSending({
                startedAt: 3_000,
                result: '',
                operationId: 'op-3',
            }),
        );

        expect(state.outboxState).toBe(FLOW_OUTBOX_STATE.NONE);
    });
});

describe('flowStatus x неполное прямое исполнение (MAJOR-2)', () => {
    it('setOutboxIncomplete ПОСЛЕ setDone: DONE+INCOMPLETE — интерфейс не обещает «карточки обновлены»', () => {
        let state = flowStatusReducer(
            sending(),
            flowStatusActions.setDone({ tasksStale: true }),
        );

        state = flowStatusReducer(
            state,
            flowStatusActions.setOutboxIncomplete(),
        );

        expect(state.stage).toBe(FLOW_STAGE.DONE);
        expect(state.outboxState).toBe(FLOW_OUTBOX_STATE.INCOMPLETE);
        // Список устарел: часть изменений всё же легла.
        expect(state.isTasksStale).toBe(true);
    });

    it('новая отправка сбрасывает INCOMPLETE прошлой', () => {
        let state = flowStatusReducer(
            sending(),
            flowStatusActions.setDone({ tasksStale: true }),
        );

        state = flowStatusReducer(
            state,
            flowStatusActions.setOutboxIncomplete(),
        );
        state = flowStatusReducer(
            state,
            flowStatusActions.setSending({
                startedAt: 4_000,
                result: '',
                operationId: 'op-4',
            }),
        );

        expect(state.outboxState).toBe(FLOW_OUTBOX_STATE.NONE);
    });
});
