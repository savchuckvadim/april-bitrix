import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    combineReducers,
    configureStore,
    createListenerMiddleware,
} from '@reduxjs/toolkit';

/**
 * Реакции быстрого итога: режим не переживает своё дело и не «протекает» в
 * следующий отчёт. Стор настоящий (листенер-middleware + редьюсеры), заменён
 * только пересчёт «за кого идёт работа» — он проверяется фактом вызова.
 */
const { syncMock } = vi.hoisted(() => ({ syncMock: vi.fn() }));

vi.mock('@/modules/features/HeadMode/model/HeadModeThunk', () => ({
    syncActingFromTask: () => () => {
        syncMock();
    },
}));

import type { AppStartListening } from '@/modules/app/model/store';
import {
    eventPlanActions,
    eventPlanReducer,
} from '@/modules/entities/EventPlan/model/EventPlanSlice';
import { EV_PLAN_PROP } from '@/modules/entities/EventPlan/type/event-plan-type';
import {
    eventActions,
    eventReducer,
} from '@/modules/processes/event/model/EventSlice';
import {
    EventItemResultType,
    eventItemActions,
    eventItemReducer,
} from '@/modules/widgets/EventItem/model/EventItemSlice';
import { QUICK_OUTCOME } from '../lib/quick-outcome';
import { startQuickOutcomeListener } from './QuickOutcomeListener';
import { quickOutcomeActions, quickOutcomeReducer } from './QuickOutcomeSlice';

const makeStore = () => {
    const listener = createListenerMiddleware();
    startQuickOutcomeListener(
        listener.startListening as unknown as AppStartListening,
    );
    return configureStore({
        reducer: combineReducers({
            event: eventReducer,
            eventPlan: eventPlanReducer,
            eventItemMenu: eventItemReducer,
            quickOutcome: quickOutcomeReducer,
        }),
        middleware: getDefault =>
            getDefault({
                serializableCheck: false,
                immutableCheck: false,
            }).prepend(listener.middleware),
    });
};

type TestStore = ReturnType<typeof makeStore>;

const open = (store: TestStore) =>
    store.dispatch(
        quickOutcomeActions.opened({
            kind: QUICK_OUTCOME.fail,
            ownerId: 369,
            restore: { workStatusId: 0, isPlanActive: true },
        }),
    );

const openOtherTask = (store: TestStore) =>
    store.dispatch(
        eventItemActions.setEventItemMenuStatus({
            status: true,
            menuType: EventItemResultType.RESULT,
        }),
    );

const rebuildPlan = (store: TestStore) =>
    store.dispatch(eventPlanActions.init({ isTmc: false, context: 'company' }));

describe('startQuickOutcomeListener', () => {
    beforeEach(() => {
        syncMock.mockReset();
    });

    it('открыли другое дело — режим итога закончен, ответственный пересчитан', () => {
        const store = makeStore();
        open(store);

        openOtherTask(store);

        expect(store.getState().quickOutcome.kind).toBeNull();
        expect(syncMock).toHaveBeenCalledTimes(1);
    });

    it('дело закрыли — режим итога закончен', () => {
        const store = makeStore();
        open(store);

        store.dispatch(
            eventItemActions.setEventItemMenuStatus({
                status: false,
                menuType: null,
            }),
        );

        expect(store.getState().quickOutcome.kind).toBeNull();
    });

    it('быстрого итога нет — смена дела ничего не пересчитывает', () => {
        const store = makeStore();

        openOtherTask(store);
        store.dispatch(quickOutcomeActions.closed());

        expect(syncMock).not.toHaveBeenCalled();
    });

    it('отчёт ушёл на финиш — окно гаснет, режим остаётся для повтора', () => {
        const store = makeStore();
        open(store);

        store.dispatch(
            eventActions.setFinishStatus({ status: true, result: '' }),
        );

        expect(store.getState().quickOutcome.isOpen).toBe(false);
        expect(store.getState().quickOutcome.kind).toBe(QUICK_OUTCOME.fail);
        expect(store.getState().quickOutcome.ownerId).toBe(369);
    });

    it('снятие флага финиша окно не трогает', () => {
        const store = makeStore();
        open(store);

        store.dispatch(
            eventActions.setFinishStatus({ status: false, result: '' }),
        );

        expect(store.getState().quickOutcome.isOpen).toBe(true);
    });

    it('обновление приложения пересобрало план — итог снова без следующего события', () => {
        const store = makeStore();
        open(store);

        rebuildPlan(store);

        expect(store.getState().eventPlan[EV_PLAN_PROP.IS_ACTIVE]).toBe(false);
    });

    it('без быстрого итога пересобранный план остаётся активным', () => {
        const store = makeStore();

        rebuildPlan(store);

        expect(store.getState().eventPlan[EV_PLAN_PROP.IS_ACTIVE]).toBe(true);
    });
});
