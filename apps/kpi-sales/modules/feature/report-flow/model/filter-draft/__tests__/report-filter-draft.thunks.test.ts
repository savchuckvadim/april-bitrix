import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import type { BXUser } from '@workspace/bx';
import type { AppDispatch, RootState } from '@/modules/app/model/store';
import reportReducer, {
    reportActions,
} from '@/modules/entities/report/model/report-slice';
import departmentReducer, {
    departmentActions,
} from '@/modules/entities/department/model/department-slice';
import { makeCurrentUser } from '@/modules/entities/department/__tests__/department-fixtures';
import {
    EReportDateMode,
    ReportDateType,
    type Filter,
    type FilterInnerCode,
} from '@/modules/entities/report/model/types/report/report-type';
import {
    reportFilterDraftActions as draftActions,
    reportFilterDraftReducer,
} from '../report-filter-draft.slice';
import {
    applyFilterDraft,
    closeFilterDraft,
    openFilterDraft,
} from '../report-filter-draft.thunks';

/*
 * Запросы отчёта — метки: проверяем, что они запущены и какое состояние
 * увидели в момент запуска (оно должно быть уже итоговым).
 */
interface RequestCall {
    kind: 'report' | 'calling';
    state: RootState;
}

const { requests } = vi.hoisted(() => ({ requests: [] as RequestCall[] }));

vi.mock('../../report-flow-thunks', () => ({
    getReportData: () => (_dispatch: unknown, getState: () => RootState) => {
        requests.push({ kind: 'report', state: getState() });
    },
}));
vi.mock('../../calling-statistics-flow-thunk', () => ({
    getCallingStatistics:
        () => (_dispatch: unknown, getState: () => RootState) => {
            requests.push({ kind: 'calling', state: getState() });
        },
}));

interface TestStore {
    dispatch: AppDispatch;
    getState: () => RootState;
}

const user = (id: number): BXUser =>
    ({ ID: id, NAME: `Имя${id}` }) as unknown as BXUser;

const USERS = [user(1), user(2), user(3)];

const action = (innerCode: FilterInnerCode): Filter =>
    ({ innerCode, name: innerCode }) as unknown as Filter;

const ITEMS = [
    action('call_plan'),
    action('call_done'),
    action('presentation_plan'),
];

/** Отчёт и структура загружены: выбраны сотрудники 1–2, все действия, ноябрь. */
const makeStore = (): TestStore => {
    const store = configureStore({
        reducer: combineReducers({
            report: reportReducer,
            department: departmentReducer,
            reportFilterDraft: reportFilterDraftReducer,
        }),
    });
    store.dispatch(
        departmentActions.setStructure({
            isMulti: false,
            multipleTag: null,
            departments: [],
            currentUser: makeCurrentUser(),
            visibleUsers: USERS,
            visibleGroups: [],
            isHeadManager: true,
            defaultSelected: [USERS[0]!, USERS[1]!],
        }),
    );
    store.dispatch(
        reportActions.setPeriod({
            mode: EReportDateMode.RANGE,
            [ReportDateType.FROM]: '2026-11-01',
            [ReportDateType.TO]: '2026-11-20',
        }),
    );
    store.dispatch(
        reportActions.setFetchedActions({ actions: ITEMS, currentFilter: null }),
    );
    store.dispatch(
        reportActions.setFetchedFilter({ filter: ITEMS, currentFilter: null }),
    );
    return store as unknown as TestStore;
};

const activeIds = (store: TestStore): number[] =>
    store.getState().department.current.map(u => Number(u.ID));

beforeEach(() => {
    requests.length = 0;
    // Фиксированный «сегодня»: режим «Сегодня» считается по часам
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 25, 12, 0, 0));
});

afterEach(() => {
    vi.useRealTimers();
});

describe('openFilterDraft / closeFilterDraft', () => {
    it('открытие — снимок действующего фильтра в черновик, панель открыта', () => {
        const store = makeStore();
        store.dispatch(openFilterDraft());
        expect(store.getState().reportFilterDraft).toEqual({
            isOpen: true,
            date: {
                from: '2026-11-01',
                to: '2026-11-20',
                mode: EReportDateMode.RANGE,
            },
            userIds: [1, 2],
            actionCodes: ['call_plan', 'call_done', 'presentation_plan'],
        });
    });

    it('правка черновика не меняет действующий фильтр', () => {
        const store = makeStore();
        const before = store.getState();
        store.dispatch(openFilterDraft());
        store.dispatch(draftActions.usersChanged([3]));
        store.dispatch(draftActions.actionToggled('call_plan'));
        store.dispatch(draftActions.dateModeChanged({ mode: EReportDateMode.WEEK }));

        const after = store.getState();
        expect(after.report).toBe(before.report);
        expect(after.department).toBe(before.department);
    });

    it('закрытие без «Применить»: панель закрыта, действующий фильтр прежний, запросов нет', () => {
        const store = makeStore();
        const before = store.getState();
        store.dispatch(openFilterDraft());
        store.dispatch(draftActions.usersChanged([3]));
        store.dispatch(draftActions.actionToggled('call_plan'));
        store.dispatch(closeFilterDraft());

        const after = store.getState();
        expect(after.reportFilterDraft.isOpen).toBe(false);
        expect(after.report).toBe(before.report);
        expect(after.department).toBe(before.department);
        expect(requests).toEqual([]);
    });

    it('повторное открытие начинается с действующего фильтра, а не с брошенного черновика', () => {
        const store = makeStore();
        store.dispatch(openFilterDraft());
        store.dispatch(draftActions.usersChanged([3]));
        store.dispatch(closeFilterDraft());
        store.dispatch(openFilterDraft());
        expect(store.getState().reportFilterDraft.userIds).toEqual([1, 2]);
    });
});

describe('applyFilterDraft — «Применить»', () => {
    it('действующий фильтр равен черновику: период, сотрудники, действия', () => {
        const store = makeStore();
        store.dispatch(openFilterDraft());
        store.dispatch(draftActions.usersChanged([3, 1]));
        store.dispatch(
            draftActions.dateChanged({
                typeOfDate: ReportDateType.TO,
                value: '2026-11-25',
            }),
        );
        store.dispatch(draftActions.actionToggled('call_done'));
        store.dispatch(applyFilterDraft());

        const { report } = store.getState();
        expect(activeIds(store)).toEqual([1, 3]);
        expect(report.date).toMatchObject({
            mode: 'range',
            from: '2026-11-01',
            to: '2026-11-25',
        });
        expect(report.filter).toEqual(['call_plan', 'presentation_plan']);
        expect(report.actions.current.map(a => a.innerCode)).toEqual([
            'call_plan',
            'presentation_plan',
        ]);
    });

    it('быстрый режим: период считается по режиму', () => {
        const store = makeStore();
        store.dispatch(openFilterDraft());
        store.dispatch(draftActions.dateModeChanged({ mode: EReportDateMode.TODAY }));
        store.dispatch(applyFilterDraft());
        expect(store.getState().report.date).toMatchObject({
            mode: 'today',
            from: '2026-11-25',
            to: '2026-11-25',
        });
    });

    it('панель закрыта, оба запроса отчёта запущены', () => {
        const store = makeStore();
        store.dispatch(openFilterDraft());
        store.dispatch(applyFilterDraft());

        expect(store.getState().reportFilterDraft.isOpen).toBe(false);
        expect(requests.map(call => call.kind).sort()).toEqual([
            'calling',
            'report',
        ]);
    });

    it('запросы видят уже итоговый фильтр целиком и закрытую панель', () => {
        const store = makeStore();
        store.dispatch(openFilterDraft());
        store.dispatch(draftActions.usersChanged([3]));
        store.dispatch(draftActions.actionToggled('call_plan'));
        store.dispatch(
            draftActions.dateChanged({
                typeOfDate: ReportDateType.FROM,
                value: '2026-11-10',
            }),
        );
        store.dispatch(applyFilterDraft());

        expect(requests).toHaveLength(2);
        for (const call of requests) {
            expect(call.state.department.current.map(u => Number(u.ID))).toEqual([3]);
            expect(call.state.report.date.from).toBe('2026-11-10');
            expect(call.state.report.filter).toEqual(['call_done', 'presentation_plan']);
            expect(call.state.reportFilterDraft.isOpen).toBe(false);
        }
    });

    it('пустой выбор сотрудников переносится как «все видимые»', () => {
        const store = makeStore();
        store.dispatch(openFilterDraft());
        store.dispatch(draftActions.usersChanged([]));
        store.dispatch(applyFilterDraft());

        expect(activeIds(store)).toEqual([1, 2, 3]);
    });

    it('выбор из невидимых сотрудников — тоже «все видимые»', () => {
        const store = makeStore();
        store.dispatch(openFilterDraft());
        store.dispatch(draftActions.usersChanged([99]));
        store.dispatch(applyFilterDraft());

        expect(activeIds(store)).toEqual([1, 2, 3]);
    });

    it('выбраны не все действия — переносится ровно выбранное, пустой набор тоже', () => {
        const store = makeStore();
        store.dispatch(openFilterDraft());
        store.dispatch(draftActions.actionToggled('call_plan'));
        store.dispatch(draftActions.actionToggled('call_done'));
        store.dispatch(draftActions.actionToggled('presentation_plan'));
        store.dispatch(applyFilterDraft());

        expect(store.getState().report.filter).toEqual([]);
        expect(store.getState().report.actions.current).toEqual([]);
    });

    it('без правок: фильтр прежний по составу, отчёт всё равно перезапрашивается', () => {
        const store = makeStore();
        const before = store.getState().report;
        store.dispatch(openFilterDraft());
        store.dispatch(applyFilterDraft());

        const { report } = store.getState();
        expect(activeIds(store)).toEqual([1, 2]);
        expect(report.date).toBe(before.date);
        expect(report.filter).toEqual(before.filter);
        expect(report.actions.current).toEqual(before.actions.current);
        expect(requests).toHaveLength(2);
    });

    it('панель не открыта: черновик не переносится, данные перезапрашиваются по действующему фильтру', () => {
        const store = makeStore();
        store.dispatch(openFilterDraft());
        store.dispatch(draftActions.usersChanged([3]));
        store.dispatch(closeFilterDraft());
        store.dispatch(applyFilterDraft());

        expect(activeIds(store)).toEqual([1, 2]);
        expect(requests).toHaveLength(2);
    });
});
