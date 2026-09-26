import { beforeEach, describe, expect, it, vi } from 'vitest';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import type { BXUser } from '@workspace/bx';
import { appActions, appReducer } from '@/modules/app/model/AppSlice';
import type { AppDispatch, RootState } from '@/modules/app/model/store';
import departmentReducer from '@/modules/entities/department/model/department-slice';
import { activateViewAs, deactivateViewAs } from '../model/view-as-thunks';

/*
 * Гард «Смотреть как…»: центральное правило VIEW_AS (флаг бэка реального
 * пользователя), а не фамилия. Перезагрузка структуры — замокана.
 */

const { getDepartmentStructure } = vi.hoisted(() => ({
    getDepartmentStructure: vi.fn(),
}));

vi.mock('@/modules/entities/department/model/department-thunk', () => ({
    getDepartmentStructure,
}));

const REAL_USER = { ID: 99, LAST_NAME: 'Савчук' } as unknown as BXUser;
const VIEWED_USER = { ID: 3, LAST_NAME: 'Менеджер' } as unknown as BXUser;
const OTHER_USER = { ID: 4, LAST_NAME: 'Другой' } as unknown as BXUser;

interface TestStore {
    dispatch: AppDispatch;
    getState: () => RootState;
}

const makeStore = (isSuperUser: boolean): TestStore => {
    const store = configureStore({
        reducer: combineReducers({
            app: appReducer,
            department: departmentReducer,
        }),
    });
    store.dispatch(
        appActions.setAppData({ domain: 'test.bitrix24.ru', user: REAL_USER }),
    );
    store.dispatch(appActions.setRealSuperUser(isSuperUser));
    return store as unknown as TestStore;
};

const viewAsId = (store: TestStore): number | null => {
    const user = store.getState().app.viewAs.user;
    return user ? Number(user.ID) : null;
};

beforeEach(() => {
    getDepartmentStructure.mockReset();
    getDepartmentStructure.mockReturnValue(() => Promise.resolve());
});

describe('activateViewAs — только реальный суперпользователь', () => {
    it('без флага бэка — no-op (фамилия больше ничего не решает)', async () => {
        const store = makeStore(false);
        await store.dispatch(activateViewAs(VIEWED_USER));
        expect(viewAsId(store)).toBeNull();
        expect(getDepartmentStructure).not.toHaveBeenCalled();
    });

    it('суперпользователь — режим включён, структура перезагружена', async () => {
        const store = makeStore(true);
        await store.dispatch(activateViewAs(VIEWED_USER));
        expect(viewAsId(store)).toBe(3);
        expect(getDepartmentStructure).toHaveBeenCalledTimes(1);
    });

    it('сам на себя — no-op', async () => {
        const store = makeStore(true);
        await store.dispatch(activateViewAs(REAL_USER));
        expect(viewAsId(store)).toBeNull();
        expect(getDepartmentStructure).not.toHaveBeenCalled();
    });

    it('внутри режима можно переключиться на другого', async () => {
        const store = makeStore(true);
        await store.dispatch(activateViewAs(VIEWED_USER));
        await store.dispatch(activateViewAs(OTHER_USER));
        expect(viewAsId(store)).toBe(4);
        expect(getDepartmentStructure).toHaveBeenCalledTimes(2);
    });
});

describe('deactivateViewAs', () => {
    it('выход — сброс режима и перезагрузка своей структуры', async () => {
        const store = makeStore(true);
        await store.dispatch(activateViewAs(VIEWED_USER));
        await store.dispatch(deactivateViewAs());
        expect(viewAsId(store)).toBeNull();
        expect(getDepartmentStructure).toHaveBeenCalledTimes(2);
        expect(store.getState().app.bitrix.isSuperUser).toBe(true);
    });

    it('вне режима — no-op', async () => {
        const store = makeStore(true);
        await store.dispatch(deactivateViewAs());
        expect(getDepartmentStructure).not.toHaveBeenCalled();
    });
});
