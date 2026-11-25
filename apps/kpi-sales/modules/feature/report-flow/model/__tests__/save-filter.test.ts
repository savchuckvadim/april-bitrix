import { beforeEach, describe, expect, it, vi } from 'vitest';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import type { BXUser } from '@workspace/bx';
import { appActions, appReducer } from '@/modules/app/model/AppSlice';
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
} from '../filter-draft/report-filter-draft.slice';
import { openFilterDraft } from '../filter-draft/report-filter-draft.thunks';
import { saveFilter } from '../report-flow-thunks';

/*
 * saveFilter: кнопка «Сохранить фильтр» видна только при открытой панели,
 * поэтому пока открыт черновик — уходят его значения, иначе — действующий
 * фильтр. Сеть и журнал клиента замоканы.
 */

const { save } = vi.hoisted(() => ({ save: vi.fn() }));

vi.mock('@/modules/entities/report/lib/api/filter-helper', () => ({
    ReportFilterHelper: class {
        save = save;
        getSaved = vi.fn();
    },
}));
vi.mock('@/modules/app/lib/helper/logClient', () => ({
    logClient: vi.fn(),
}));

interface TestStore {
    dispatch: AppDispatch;
    getState: () => RootState;
}

const user = (id: number): BXUser =>
    ({ ID: id, NAME: `Имя${id}` }) as unknown as BXUser;

const USERS = [user(1), user(2), user(3)];
const REAL_USER = { ID: 99, LAST_NAME: 'Руководитель' } as unknown as BXUser;

const action = (innerCode: FilterInnerCode): Filter =>
    ({ innerCode, name: innerCode }) as unknown as Filter;

const ITEMS = [action('call_plan'), action('call_done')];

/** Фильтр действует: 1–20 ноября, сотрудники 1 и 2, все действия. */
const makeStore = (): TestStore => {
    const store = configureStore({
        reducer: combineReducers({
            app: appReducer,
            report: reportReducer,
            department: departmentReducer,
            reportFilterDraft: reportFilterDraftReducer,
        }),
    });
    store.dispatch(
        appActions.setAppData({ domain: 'test.bitrix24.ru', user: REAL_USER }),
    );
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

const sentFilter = () => {
    expect(save).toHaveBeenCalledTimes(1);
    return save.mock.calls[0]?.[0]?.filter;
};

beforeEach(() => {
    save.mockReset();
    save.mockResolvedValue(undefined);
});

describe('saveFilter', () => {
    it('панель закрыта — сохраняется действующий фильтр', async () => {
        const store = makeStore();
        expect(await store.dispatch(saveFilter())).toBe(true);

        expect(save.mock.calls[0]?.[0]).toMatchObject({
            domain: 'test.bitrix24.ru',
            userId: 99,
        });
        expect(sentFilter()).toMatchObject({
            version: 2,
            actions: ['call_plan', 'call_done'],
            dates: { mode: 'custom', from: '2026-11-01', to: '2026-11-20' },
            legacyUserIds: [1, 2],
        });
    });

    it('панель открыта — сохраняется черновик: даты, сотрудники, действия', async () => {
        const store = makeStore();
        store.dispatch(openFilterDraft());
        store.dispatch(draftActions.usersChanged([3]));
        store.dispatch(draftActions.actionToggled('call_plan'));
        store.dispatch(
            draftActions.dateChanged({
                typeOfDate: ReportDateType.FROM,
                value: '2026-10-05',
            }),
        );
        store.dispatch(
            draftActions.dateChanged({
                typeOfDate: ReportDateType.TO,
                value: '2026-10-25',
            }),
        );
        expect(await store.dispatch(saveFilter())).toBe(true);

        expect(sentFilter()).toMatchObject({
            version: 2,
            actions: ['call_done'],
            dates: { mode: 'custom', from: '2026-10-05', to: '2026-10-25' },
            legacyUserIds: [3],
        });
    });

    it('раздел «Действия» скрыт (вкладка без него): правится остальное, действия уходят прежние', async () => {
        const store = makeStore();
        store.dispatch(reportActions.setActionsSelection(['call_done']));
        // Раздела нет — действия в черновике не трогают, меняются сотрудники.
        store.dispatch(openFilterDraft());
        store.dispatch(draftActions.usersChanged([3]));
        await store.dispatch(saveFilter());

        expect(sentFilter()).toMatchObject({
            actions: ['call_done'],
            legacyUserIds: [3],
        });
    });

    it('панель открыта, быстрый режим — уходит только режим', async () => {
        const store = makeStore();
        store.dispatch(openFilterDraft());
        store.dispatch(
            draftActions.dateModeChanged({ mode: EReportDateMode.MONTH }),
        );
        await store.dispatch(saveFilter());

        expect(sentFilter().dates).toEqual({ mode: 'month' });
    });

    it('панель открыта, никто не выбран — сохраняются все видимые', async () => {
        const store = makeStore();
        store.dispatch(openFilterDraft());
        store.dispatch(draftActions.usersChanged([]));
        await store.dispatch(saveFilter());

        expect(sentFilter().legacyUserIds).toEqual([1, 2, 3]);
    });

    it('сохранение не меняет действующий фильтр и не закрывает панель', async () => {
        const store = makeStore();
        store.dispatch(openFilterDraft());
        store.dispatch(draftActions.usersChanged([3]));
        const before = store.getState();
        await store.dispatch(saveFilter());

        const after = store.getState();
        expect(after.department).toBe(before.department);
        expect(after.report.date).toBe(before.report.date);
        expect(after.report.filter).toBe(before.report.filter);
        expect(after.reportFilterDraft.isOpen).toBe(true);
        expect(after.report.isFilterLoading).toBe(false);
    });

    it('в режиме «Смотреть как…» не сохраняет', async () => {
        const store = makeStore();
        store.dispatch(appActions.setViewAsUser(USERS[2]!));
        expect(await store.dispatch(saveFilter())).toBe(false);
        expect(save).not.toHaveBeenCalled();
    });

    it('ошибка бэка — false, флаг загрузки сброшен', async () => {
        save.mockRejectedValue(new Error('бэк недоступен'));
        const store = makeStore();
        expect(await store.dispatch(saveFilter())).toBe(false);
        expect(store.getState().report.isFilterLoading).toBe(false);
    });
});
