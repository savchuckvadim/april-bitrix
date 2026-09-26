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
import type { CurrentUserInfo } from '@/modules/entities/department/model';
import { ReportDateType } from '@/modules/entities/report/model/types/report/report-type';
import { aiAnalyticsReducer } from '../model/ai-analytics-slice';

/* Общий стор для тестов thunks Фазы 2 (без моков — их объявляет каждый файл). */

export const TEST_DOMAIN = 'test.bitrix24.ru';
export const TEST_USER = { ID: 42, LAST_NAME: 'Тест' } as unknown as BXUser;
export const TEST_REQUESTER = {
    domain: TEST_DOMAIN,
    requesterUserId: '42',
};
export const TEST_MANAGERS = [{ ID: 7 }, { ID: 3 }] as unknown as BXUser[];

export interface AiTestStore {
    dispatch: AppDispatch;
    getState: () => RootState;
}

export interface AiTestStoreOptions {
    /** Эффективный пользователь — руководитель (department.isHeadManager). */
    leader?: boolean;
    /** Период глобального фильтра и выбранные менеджеры (тяжёлые ручки). */
    period?: boolean;
}

/** Роль текущего пользователя структуры: руководитель ОП либо менеджер. */
const currentUser = (leader: boolean): CurrentUserInfo =>
    ({
        userId: 42,
        isHead: leader,
        headOf: leader ? 'op' : null,
        headOfDepartmentIds: leader ? [10] : [],
        visibility: leader ? 'department' : 'own',
        headOfSource: 'structure',
        colleagues: { sameGroup: [], sameDepartment: [] },
    }) as unknown as CurrentUserInfo;

export const makeAiStore = (options: AiTestStoreOptions = {}): AiTestStore => {
    const store = configureStore({
        reducer: combineReducers({
            app: appReducer,
            report: reportReducer,
            department: departmentReducer,
            aiAnalytics: aiAnalyticsReducer,
        }),
    });
    store.dispatch(
        appActions.setAppData({ domain: TEST_DOMAIN, user: TEST_USER }),
    );
    if (options.leader !== undefined) {
        store.dispatch(
            departmentActions.setStructure({
                isMulti: false,
                multipleTag: null,
                departments: [],
                currentUser: currentUser(options.leader),
                visibleUsers: TEST_MANAGERS,
                visibleGroups: [],
                isHeadManager: options.leader,
                defaultSelected: TEST_MANAGERS,
            }),
        );
    }
    if (options.period) {
        store.dispatch(
            reportActions.setChangedDate({
                typeOfDate: ReportDateType.FROM,
                value: '2026-08-01',
            }),
        );
        store.dispatch(
            reportActions.setChangedDate({
                typeOfDate: ReportDateType.TO,
                value: '2026-08-31',
            }),
        );
        store.dispatch(departmentActions.setDepartmentCurrent(TEST_MANAGERS));
    }
    return store as unknown as AiTestStore;
};

/** Дать отработать микрозадачам thunk'ов и listeners. */
export const flush = (): Promise<void> =>
    new Promise<void>(resolve => setTimeout(resolve, 0));
