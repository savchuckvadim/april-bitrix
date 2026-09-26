import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    combineReducers,
    configureStore,
    isAction,
    type Middleware,
} from '@reduxjs/toolkit';
import type { BXUser } from '@workspace/bx';
import { appActions, appReducer } from '@/modules/app/model/AppSlice';
import type { AppDispatch, RootState } from '@/modules/app/model/store';
import departmentReducer from '../model/department-slice';
import { getDepartmentStructure } from '../model/department-thunk';
import type { CurrentUserInfo } from '../model';
import {
    makeCurrentUser,
    makeStructure,
    makeSuperUser,
} from './department-fixtures';

/*
 * Флаг суперпользователя вендора РЕАЛЬНОГО пользователя: пишется в app
 * только из структуры без viewAs и строго ДО setStructure (listener-цепочки
 * читают права сразу после неё); ошибка загрузки флаг не трогает.
 */

// vi.mock поднимается выше импортов — моки объявляем через vi.hoisted.
const { getStructure } = vi.hoisted(() => ({ getStructure: vi.fn() }));

vi.mock('../lib/api/department-helper', () => ({
    DepartmentHelper: class {
        getStructure = getStructure;
    },
}));
vi.mock('@/modules/app/lib/helper/logClient', () => ({ logClient: vi.fn() }));

const REAL_USER = { ID: 99, LAST_NAME: 'Вендор' } as unknown as BXUser;
const VIEWED_USER = { ID: 3, LAST_NAME: 'Менеджер' } as unknown as BXUser;

interface TestStore {
    dispatch: AppDispatch;
    getState: () => RootState;
}

/** Стор app + department и журнал типов экшенов (порядок диспатча). */
const makeStore = (): { store: TestStore; log: string[] } => {
    const log: string[] = [];
    const recorder: Middleware = () => next => action => {
        if (isAction(action)) log.push(action.type);
        return next(action);
    };
    const store = configureStore({
        reducer: combineReducers({
            app: appReducer,
            department: departmentReducer,
        }),
        middleware: getDefault => getDefault().concat(recorder),
    });
    store.dispatch(
        appActions.setAppData({
            domain: 'test.bitrix24.ru',
            user: REAL_USER,
        }),
    );
    log.length = 0;
    return { store: store as unknown as TestStore, log };
};

const SET_FLAG = appActions.setRealSuperUser.type;

beforeEach(() => {
    getStructure.mockReset();
});

describe('getDepartmentStructure — флаг суперпользователя вендора', () => {
    it('без viewAs: флаг бэка пишется в app ДО setStructure', async () => {
        getStructure.mockResolvedValue(makeStructure(makeSuperUser()));
        const { store, log } = makeStore();
        await store.dispatch(getDepartmentStructure());

        expect(store.getState().app.bitrix.isSuperUser).toBe(true);
        expect(log).toEqual([
            'department/setLoading',
            SET_FLAG,
            'department/setStructure',
        ]);
        expect(getStructure).toHaveBeenCalledWith(
            expect.objectContaining({ userId: 99 }),
        );
    });

    it('без viewAs: обычный пользователь сбрасывает прежний флаг', async () => {
        getStructure.mockResolvedValue(makeStructure(makeCurrentUser()));
        const { store } = makeStore();
        store.dispatch(appActions.setRealSuperUser(true));
        await store.dispatch(getDepartmentStructure());
        expect(store.getState().app.bitrix.isSuperUser).toBe(false);
    });

    it('старый бэк без поля isSuperUser — false', async () => {
        const legacy = {
            ...makeCurrentUser({ headOf: 'cup', visibility: 'all' }),
            isSuperUser: undefined,
        } as unknown as CurrentUserInfo;
        getStructure.mockResolvedValue(makeStructure(legacy));
        const { store } = makeStore();
        await store.dispatch(getDepartmentStructure());
        expect(store.getState().app.bitrix.isSuperUser).toBe(false);
    });

    it('в viewAs: структура просматриваемого, флаг реального не трогаем', async () => {
        getStructure.mockResolvedValue(
            makeStructure(makeCurrentUser({ userId: 3 })),
        );
        const { store, log } = makeStore();
        store.dispatch(appActions.setRealSuperUser(true));
        store.dispatch(appActions.setViewAsUser(VIEWED_USER));
        log.length = 0;
        await store.dispatch(getDepartmentStructure());

        expect(getStructure).toHaveBeenCalledWith(
            expect.objectContaining({ userId: 3 }),
        );
        expect(log).not.toContain(SET_FLAG);
        expect(store.getState().app.bitrix.isSuperUser).toBe(true);
        expect(store.getState().department.currentUser?.userId).toBe(3);
    });

    it('ошибка загрузки — флаг не меняется, статус error', async () => {
        getStructure.mockRejectedValue(new Error('500'));
        const { store, log } = makeStore();
        store.dispatch(appActions.setRealSuperUser(true));
        log.length = 0;
        await store.dispatch(getDepartmentStructure());

        expect(log).not.toContain(SET_FLAG);
        expect(store.getState().app.bitrix.isSuperUser).toBe(true);
        expect(store.getState().department.status).toBe('error');
    });

    it('setAppData сбрасывает флаг до следующей структуры', () => {
        const { store } = makeStore();
        store.dispatch(appActions.setRealSuperUser(true));
        store.dispatch(
            appActions.setAppData({
                domain: 'other.bitrix24.ru',
                user: REAL_USER,
            }),
        );
        expect(store.getState().app.bitrix.isSuperUser).toBe(false);
    });
});
