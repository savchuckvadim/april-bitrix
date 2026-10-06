import { describe, expect, it, vi } from 'vitest';
import {
    combineReducers,
    configureStore,
    type Middleware,
} from '@reduxjs/toolkit';

/**
 * Быстрый итог («Продажа» / «Отказ»): что именно готовит открытие окна и что
 * возвращает отмена. Редьюсеры настоящие — проверяется итоговое состояние
 * формы, а соседние потоки (открытие дела, режим руководителя, отправка)
 * заменены метками, чтобы был виден порядок шагов.
 */
vi.mock('@/modules/widgets/EventItem/model/EventItemThunk', () => ({
    getResultMenu: (type: string, task: unknown) => ({
        type: 'test/getResultMenu',
        payload: { type, task },
    }),
    cancelResultMenu: () => ({ type: 'test/cancelResultMenu' }),
}));

vi.mock('@/modules/features/HeadMode/model/HeadModeThunk', () => ({
    syncActingFromTask: () => ({ type: 'test/syncActingFromTask' }),
}));

vi.mock('@/modules/processes/event/model/SendThunk', () => ({
    send: () => ({ type: 'test/send' }),
}));

import {
    eventReportActions,
    eventReportReducer,
} from '@/modules/entities/EventReport/model/EventReportSlice';
import { EV_REPORT_PROP } from '@/modules/entities/EventReport/type/event-report-type';
import { eventPlanReducer } from '@/modules/entities/EventPlan/model/EventPlanSlice';
import { EV_PLAN_PROP } from '@/modules/entities/EventPlan/type/event-plan-type';
import {
    eventItemActions,
    eventItemReducer,
} from '@/modules/widgets/EventItem/model/EventItemSlice';
import { QUICK_OUTCOME } from '../lib/quick-outcome';
import { quickOutcomeReducer } from './QuickOutcomeSlice';
import {
    cancelQuickOutcome,
    openQuickOutcome,
    submitQuickOutcome,
} from './QuickOutcomeThunk';

interface AppStub {
    bitrix: {
        user: { ID: number } | null;
        deal: { ASSIGNED_BY_ID?: string } | null;
    };
}

const makeStore = (app: AppStub) => {
    const types: string[] = [];
    const log: Middleware = () => next => action => {
        types.push((action as { type: string }).type);
        return next(action);
    };
    const store = configureStore({
        reducer: combineReducers({
            app: (state: AppStub = app) => state,
            eventReport: eventReportReducer,
            eventPlan: eventPlanReducer,
            eventItemMenu: eventItemReducer,
            quickOutcome: quickOutcomeReducer,
        }),
        middleware: getDefault =>
            getDefault({
                serializableCheck: false,
                immutableCheck: false,
            }).concat(log),
    });
    return { store, types };
};

const withDeal: AppStub = {
    bitrix: { user: { ID: 11 }, deal: { ASSIGNED_BY_ID: '369' } },
};

const workStatusOf = (store: ReturnType<typeof makeStore>['store']) =>
    store.getState().eventReport.report[EV_REPORT_PROP.WORK_STATUS].current
        .code;

describe('openQuickOutcome', () => {
    it('готовит отчёт-отказ на ответственного сделки', async () => {
        const { store } = makeStore(withDeal);

        const opened = await store.dispatch(
            openQuickOutcome(QUICK_OUTCOME.fail) as never,
        );

        expect(opened).toBe(true);
        expect(workStatusOf(store)).toBe('fail');
        // Итог финальный: следующее событие не планируется.
        expect(store.getState().eventPlan[EV_PLAN_PROP.IS_ACTIVE]).toBe(false);
        expect(store.getState().quickOutcome).toEqual({
            kind: QUICK_OUTCOME.fail,
            isOpen: true,
            ownerId: 369,
            restore: { workStatusId: 0, isPlanActive: true },
        });
    });

    it('режим включается ПОСЛЕ открытия дела, ответственный — после режима', async () => {
        const { store, types } = makeStore(withDeal);

        await store.dispatch(openQuickOutcome(QUICK_OUTCOME.sale) as never);

        expect(types).toEqual([
            'test/getResultMenu',
            'eventReport/setReportProp',
            'eventPlan/setActiveStatus',
            'quickOutcome/opened',
            'test/syncActingFromTask',
        ]);
        expect(workStatusOf(store)).toBe('success');
    });

    it('сделки в контексте нет — итог записывается на самого пользователя', async () => {
        const { store } = makeStore({
            bitrix: { user: { ID: 11 }, deal: null },
        });

        await store.dispatch(openQuickOutcome(QUICK_OUTCOME.fail) as never);

        expect(store.getState().quickOutcome.ownerId).toBe(11);
    });

    it('статус не применился (у ТМЦ нет «Продажи») — окно не открывается', async () => {
        const { store, types } = makeStore(withDeal);
        store.dispatch(eventReportActions.setMode({ depModeId: 1 }));
        types.length = 0;

        const opened = await store.dispatch(
            openQuickOutcome(QUICK_OUTCOME.sale) as never,
        );

        expect(opened).toBe(false);
        expect(workStatusOf(store)).toBe('inJob');
        expect(store.getState().quickOutcome.kind).toBeNull();
        expect(types).toEqual([
            'test/getResultMenu',
            'eventReport/setReportProp',
            'test/cancelResultMenu',
        ]);
    });
});

describe('cancelQuickOutcome', () => {
    it('возвращает форму в состояние до открытия окна', async () => {
        const { store, types } = makeStore(withDeal);
        await store.dispatch(openQuickOutcome(QUICK_OUTCOME.fail) as never);
        store.dispatch(eventItemActions.setPreflightOpen({ isOpen: true }));
        types.length = 0;

        await store.dispatch(cancelQuickOutcome() as never);

        expect(workStatusOf(store)).toBe('inJob');
        expect(store.getState().eventPlan[EV_PLAN_PROP.IS_ACTIVE]).toBe(true);
        expect(store.getState().eventItemMenu.isPreflightOpen).toBe(false);
        expect(store.getState().quickOutcome).toEqual({
            kind: null,
            isOpen: false,
            ownerId: null,
            restore: null,
        });
    });

    it('режим выключается ДО закрытия дела', async () => {
        const { store, types } = makeStore(withDeal);
        await store.dispatch(openQuickOutcome(QUICK_OUTCOME.fail) as never);
        types.length = 0;

        await store.dispatch(cancelQuickOutcome() as never);

        expect(types.indexOf('quickOutcome/closed')).toBeLessThan(
            types.indexOf('test/cancelResultMenu'),
        );
    });

    it('быстрого итога нет — ничего не трогает', async () => {
        const { store, types } = makeStore(withDeal);

        await store.dispatch(cancelQuickOutcome() as never);

        expect(types).toEqual([]);
    });
});

describe('submitQuickOutcome', () => {
    it('отправляет обычным потоком отчёта', async () => {
        const { store, types } = makeStore(withDeal);

        await store.dispatch(submitQuickOutcome() as never);

        expect(types).toEqual(['test/send']);
    });
});
