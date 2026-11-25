import { describe, expect, it } from 'vitest';
import {
    combineReducers,
    configureStore,
    createListenerMiddleware,
    type ListenerMiddlewareInstance,
} from '@reduxjs/toolkit';
import type { BXUser } from '@workspace/bx';
import type {
    AppDispatch,
    RootState,
    ThunkExtraArgument,
} from '@/modules/app/model/store';
import reportReducer, {
    reportActions,
} from '@/modules/entities/report/model/report-slice';
import departmentReducer, {
    departmentActions,
} from '@/modules/entities/department/model/department-slice';
import { makeCurrentUser } from '@/modules/entities/department/__tests__/department-fixtures';
import type {
    Filter,
    FilterInnerCode,
} from '@/modules/entities/report/model/types/report/report-type';
import {
    mergedReportActions,
    mergedReportReducer,
} from '../../MergedReportSlice';
import { startMergedFilterListeners } from '../merged-filter.listener';

/*
 * Объединённый отчёт и главный фильтр: показатели (колонки) подстраиваются
 * под действия главного фильтра, а выбор сотрудников главным фильтром не
 * правится — своего выбора сотрудников у объединённого отчёта во фрейме нет.
 */

type TestListener = ListenerMiddlewareInstance<
    RootState,
    AppDispatch,
    ThunkExtraArgument
>;

const user = (id: number): BXUser =>
    ({ ID: id, NAME: `Имя${id}` }) as unknown as BXUser;

const USERS = [user(1), user(2), user(3)];

const action = (innerCode: FilterInnerCode, name: string): Filter =>
    ({ innerCode, name }) as unknown as Filter;

const ITEMS = [
    action('call_plan', 'Звонок запланирован'),
    action('call_done', 'Звонок проведён'),
    action('presentation_plan', 'Презентация запланирована'),
];

/** Название звонкового показателя: главным фильтром не управляется. */
const CALLING_COLUMN = 'Звонки больше минуты';

/** Все действия включены в главном фильтре. */
const makeStore = () => {
    const listener = createListenerMiddleware();
    const store = configureStore({
        reducer: combineReducers({
            report: reportReducer,
            department: departmentReducer,
            mergedReport: mergedReportReducer,
        }),
        middleware: getDefault => getDefault().prepend(listener.middleware),
    });
    startMergedFilterListeners(listener as unknown as TestListener);

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
        reportActions.setFetchedActions({ actions: ITEMS, currentFilter: null }),
    );
    return store;
};

/** Эффекты listener'ов асинхронные: даём им закончиться. */
const flush = () => new Promise<void>(resolve => setTimeout(resolve, 0));

describe('синк показателей с действиями главного фильтра', () => {
    it('действие снято в главном фильтре — его колонка убирается из выбора', async () => {
        const store = makeStore();
        store.dispatch(
            mergedReportActions.setSelectedActions([
                CALLING_COLUMN,
                'Звонок запланирован',
                'Звонок проведён',
            ]),
        );

        store.dispatch(
            reportActions.setActionsSelection(['call_plan', 'presentation_plan']),
        );
        await flush();

        expect(store.getState().mergedReport.selectedActions).toEqual([
            CALLING_COLUMN,
            'Звонок запланирован',
        ]);
    });

    it('действие добавлено в главный фильтр — его колонка включается в выбор', async () => {
        const store = makeStore();
        store.dispatch(reportActions.setActionsSelection(['call_plan']));
        await flush();
        store.dispatch(
            mergedReportActions.setSelectedActions([
                CALLING_COLUMN,
                'Звонок запланирован',
            ]),
        );

        store.dispatch(
            reportActions.setActionsSelection(['call_plan', 'call_done']),
        );
        await flush();

        expect(store.getState().mergedReport.selectedActions).toEqual([
            CALLING_COLUMN,
            'Звонок запланирован',
            'Звонок проведён',
        ]);
    });

    it('звонковый показатель главным фильтром не управляется', async () => {
        const store = makeStore();
        store.dispatch(
            mergedReportActions.setSelectedActions([
                CALLING_COLUMN,
                'Звонок запланирован',
            ]),
        );

        store.dispatch(reportActions.setActionsSelection([]));
        await flush();

        expect(store.getState().mergedReport.selectedActions).toEqual([
            CALLING_COLUMN,
        ]);
    });

    it('пустой выбор («все колонки») остаётся пустым при любых правках главного фильтра', async () => {
        const store = makeStore();

        store.dispatch(reportActions.setActionsSelection(['call_done']));
        await flush();
        store.dispatch(
            reportActions.setActionsSelection(['call_plan', 'call_done']),
        );
        await flush();

        expect(store.getState().mergedReport.selectedActions).toEqual([]);
    });

    it('загрузка списка действий с сохранённым фильтром тоже убирает выключенные', async () => {
        const store = makeStore();
        store.dispatch(
            mergedReportActions.setSelectedActions([
                'Звонок запланирован',
                'Презентация запланирована',
            ]),
        );

        // Сохранённый фильтр оставил включёнными только два действия.
        store.dispatch(
            reportActions.setFetchedActions({
                actions: ITEMS,
                currentFilter: ['call_plan', 'call_done'],
            }),
        );
        await flush();

        expect(store.getState().mergedReport.selectedActions).toEqual([
            'Звонок запланирован',
        ]);
    });
});

describe('главный фильтр и выбор сотрудников объединённого отчёта', () => {
    it('смена сотрудников главного фильтра выбор сотрудников не трогает', async () => {
        const store = makeStore();
        // Выбор сотрудников бывает только на публичной странице (из снимка).
        store.dispatch(mergedReportActions.setSelectedUsers([1, 2]));

        store.dispatch(departmentActions.setDepartmentCurrent([USERS[2]!]));
        await flush();

        expect(store.getState().mergedReport.selectedUsers).toEqual([1, 2]);
    });

    it('смена сотрудников главного фильтра не создаёт выбор там, где его нет', async () => {
        const store = makeStore();

        store.dispatch(
            departmentActions.setDepartmentCurrent([USERS[0]!, USERS[2]!]),
        );
        await flush();

        expect(store.getState().mergedReport.selectedUsers).toEqual([]);
    });

    it('смена сотрудников главного фильтра не трогает и показатели', async () => {
        const store = makeStore();
        store.dispatch(
            mergedReportActions.setSelectedActions(['Звонок запланирован']),
        );

        store.dispatch(departmentActions.setDepartmentCurrent([USERS[2]!]));
        await flush();

        expect(store.getState().mergedReport.selectedActions).toEqual([
            'Звонок запланирован',
        ]);
    });
});
