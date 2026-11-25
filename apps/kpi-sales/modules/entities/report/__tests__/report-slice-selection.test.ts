import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import type { AppDispatch, RootState } from '@/modules/app/model/store';
import reportReducer, { reportActions } from '../model/report-slice';
import { setCurrentActions } from '../model/report-thunks';
import {
    EReportDateMode,
    ReportDateType,
    type Filter,
    type FilterInnerCode,
} from '../model/types/report/report-type';

/*
 * Редьюсеры «целиком» (перенос черновика фильтра одним действием) должны
 * давать то же состояние, что прежние серии действий: setChangedDateMode +
 * setChangedDate для периода и переключения thunk'ом setCurrentActions для
 * действий.
 */

interface TestStore {
    dispatch: AppDispatch;
    getState: () => RootState;
}

const makeStore = (): TestStore =>
    configureStore({
        reducer: combineReducers({ report: reportReducer }),
    }) as unknown as TestStore;

const action = (innerCode: FilterInnerCode): Filter =>
    ({ innerCode, name: innerCode }) as unknown as Filter;

const ITEMS = [
    action('call_plan'),
    action('call_done'),
    action('presentation_plan'),
    action('presentation_done'),
];

/** Отчёт загружен: все действия выбраны (как после applyReportData). */
const makeLoadedStore = (): TestStore => {
    const store = makeStore();
    store.dispatch(
        reportActions.setFetchedActions({ actions: ITEMS, currentFilter: null }),
    );
    store.dispatch(
        reportActions.setFetchedFilter({ filter: ITEMS, currentFilter: null }),
    );
    return store;
};

const readActions = (store: TestStore) => {
    const { filter, actions } = store.getState().report;
    return { filter, current: actions.current, items: actions.items };
};

beforeEach(() => {
    vi.useFakeTimers();
    // Среда 25.11.2026: неделя 23–29 ноября, месяц 1–30 ноября
    vi.setSystemTime(new Date(2026, 10, 25, 12, 0, 0));
});

afterEach(() => {
    vi.useRealTimers();
});

describe('report-slice: setActionsSelection ≡ серия setCurrentActions', () => {
    it('выключили и вернули действие — порядок и состав те же', () => {
        const series = makeLoadedStore();
        void series.dispatch(setCurrentActions('call_done'));
        void series.dispatch(setCurrentActions('call_done'));
        void series.dispatch(setCurrentActions('presentation_plan'));

        const whole = makeLoadedStore();
        whole.dispatch(
            reportActions.setActionsSelection([
                'call_plan',
                'presentation_done',
                'call_done',
            ]),
        );

        expect(readActions(whole)).toEqual(readActions(series));
        expect(readActions(whole).filter).toEqual([
            'call_plan',
            'presentation_done',
            'call_done',
        ]);
    });

    it('включили выключенное — оно добавляется в конец', () => {
        const series = makeLoadedStore();
        void series.dispatch(setCurrentActions('call_plan'));
        void series.dispatch(setCurrentActions('call_done'));
        void series.dispatch(setCurrentActions('call_plan'));

        const whole = makeLoadedStore();
        whole.dispatch(
            reportActions.setActionsSelection([
                'presentation_plan',
                'presentation_done',
                'call_plan',
            ]),
        );

        expect(readActions(whole)).toEqual(readActions(series));
    });

    it('actions.current — те же объекты из actions.items, а не копии', () => {
        const store = makeLoadedStore();
        store.dispatch(reportActions.setActionsSelection(['call_done']));
        const { current, items } = readActions(store);
        expect(current).toHaveLength(1);
        expect(items).toContain(current[0]);
    });

    it('пустой набор — filter и current пусты, список действий не тронут', () => {
        const store = makeLoadedStore();
        store.dispatch(reportActions.setActionsSelection([]));
        const { filter, current, items } = readActions(store);
        expect(filter).toEqual([]);
        expect(current).toEqual([]);
        expect(items).toEqual(ITEMS);
    });

    it('код без действия в списке остаётся в filter, но не попадает в current', () => {
        const store = makeLoadedStore();
        store.dispatch(
            reportActions.setActionsSelection(['call_plan', 'ev_fail_done']),
        );
        const { filter, current } = readActions(store);
        expect(filter).toEqual(['call_plan', 'ev_fail_done']);
        expect(current.map(item => item.innerCode)).toEqual(['call_plan']);
    });

    it('повторяющиеся коды схлопываются', () => {
        const store = makeLoadedStore();
        store.dispatch(
            reportActions.setActionsSelection(['call_plan', 'call_plan']),
        );
        const { filter, current } = readActions(store);
        expect(filter).toEqual(['call_plan']);
        expect(current).toHaveLength(1);
    });

    it('даты и прочее состояние отчёта не меняются', () => {
        const store = makeLoadedStore();
        const before = store.getState().report;
        store.dispatch(reportActions.setActionsSelection(['call_plan']));
        const after = store.getState().report;
        expect(after.date).toBe(before.date);
        expect(after.report).toBe(before.report);
        expect(after.savedFilter).toBe(before.savedFilter);
    });
});

describe('report-slice: setPeriod ≡ серия setChangedDateMode/setChangedDate', () => {
    it('диапазон: режим и обе даты', () => {
        const series = makeStore();
        series.dispatch(
            reportActions.setChangedDateMode({ mode: EReportDateMode.RANGE }),
        );
        series.dispatch(
            reportActions.setChangedDate({
                typeOfDate: ReportDateType.FROM,
                value: '2026-11-02',
            }),
        );
        series.dispatch(
            reportActions.setChangedDate({
                typeOfDate: ReportDateType.TO,
                value: '2026-11-20',
            }),
        );

        const whole = makeStore();
        whole.dispatch(
            reportActions.setPeriod({
                mode: EReportDateMode.RANGE,
                [ReportDateType.FROM]: '2026-11-02',
                [ReportDateType.TO]: '2026-11-20',
            }),
        );

        expect(whole.getState().report.date).toEqual(
            series.getState().report.date,
        );
        expect(whole.getState().report.date).toMatchObject({
            mode: 'range',
            from: '2026-11-02',
            to: '2026-11-20',
        });
    });

    it('диапазон: даты нормализуются так же, как в setChangedDate (ISO со временем, dd.MM.yyyy)', () => {
        const store = makeStore();
        store.dispatch(
            reportActions.setPeriod({
                mode: EReportDateMode.RANGE,
                [ReportDateType.FROM]: '2026-11-03T10:30:00.000',
                [ReportDateType.TO]: '21.11.2026',
            }),
        );
        expect(store.getState().report.date).toMatchObject({
            from: '2026-11-03',
            to: '2026-11-21',
        });
    });

    it.each([
        [EReportDateMode.TODAY, '2026-11-25', '2026-11-25'],
        [EReportDateMode.WEEK, '2026-11-23', '2026-11-29'],
        [EReportDateMode.MONTH, '2026-11-01', '2026-11-30'],
    ])(
        'быстрый режим %s: даты считаются по режиму, значения из payload игнорируются',
        (mode, from, to) => {
            const series = makeStore();
            series.dispatch(reportActions.setChangedDateMode({ mode }));

            const whole = makeStore();
            whole.dispatch(
                reportActions.setPeriod({
                    mode,
                    [ReportDateType.FROM]: '2000-01-01',
                    [ReportDateType.TO]: '2000-01-02',
                }),
            );

            expect(whole.getState().report.date).toEqual(
                series.getState().report.date,
            );
            expect(whole.getState().report.date).toMatchObject({
                mode,
                from,
                to,
            });
        },
    );

    it('нераспознанная дата диапазона не затирает прежнюю', () => {
        const store = makeStore();
        const before = store.getState().report.date;
        store.dispatch(
            reportActions.setPeriod({
                mode: EReportDateMode.RANGE,
                [ReportDateType.FROM]: '',
                [ReportDateType.TO]: '2026-11-20',
            }),
        );
        const after = store.getState().report.date;
        expect(after.from).toBe(before.from);
        expect(after.to).toBe('2026-11-20');
    });

    it('действия и фильтр не меняются', () => {
        const store = makeLoadedStore();
        const before = store.getState().report;
        store.dispatch(
            reportActions.setPeriod({
                mode: EReportDateMode.WEEK,
                [ReportDateType.FROM]: '',
                [ReportDateType.TO]: '',
            }),
        );
        const after = store.getState().report;
        expect(after.filter).toBe(before.filter);
        expect(after.actions).toBe(before.actions);
    });
});
