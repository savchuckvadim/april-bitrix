import { describe, expect, it } from 'vitest';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import type { BXUser } from '@workspace/bx';
import { appActions, appReducer } from '@/modules/app/model/AppSlice';
import type { RootState } from '@/modules/app/model/store';
import departmentReducer, {
    departmentActions,
} from '@/modules/entities/department/model/department-slice';
import type { CurrentUserInfo } from '@/modules/entities/department/model';
import { checkAccess, EAccessFeature } from '@/modules/shared/access';
import { selectAccessContext } from '../use-access';

/*
 * Контекст прав: суперпользователь — ТОЛЬКО флаг реального пользователя
 * в app (его пишет department-thunk), не department.currentUser.
 */

const REAL_USER = { ID: 99, LAST_NAME: 'Вендор' } as unknown as BXUser;
const VIEWED_USER = { ID: 3, LAST_NAME: 'Менеджер' } as unknown as BXUser;

const currentUser = (overrides: Partial<CurrentUserInfo>): CurrentUserInfo => ({
    userId: 3,
    isHead: false,
    headOf: null,
    headOfDepartmentIds: [],
    visibility: 'own',
    headOfSource: 'structure',
    subordinateIds: [],
    isSuperUser: false,
    colleagues: { group: [], department: [] },
    ...overrides,
});

const makeStore = (structureUser: CurrentUserInfo | null = null) => {
    const store = configureStore({
        reducer: combineReducers({
            app: appReducer,
            department: departmentReducer,
        }),
    });
    store.dispatch(
        appActions.setAppData({ domain: 'test.bitrix24.ru', user: REAL_USER }),
    );
    if (structureUser) {
        store.dispatch(
            departmentActions.setStructure({
                isMulti: false,
                multipleTag: null,
                departments: [],
                currentUser: structureUser,
                visibleUsers: [],
                visibleGroups: [],
                isHeadManager: structureUser.headOf !== null,
                defaultSelected: [],
            }),
        );
    }
    const ctx = () =>
        selectAccessContext(store.getState() as unknown as RootState);
    return { store, ctx };
};

describe('selectAccessContext — суперпользователь вендора', () => {
    it('по умолчанию флага нет', () => {
        const { ctx } = makeStore();
        expect(ctx().isSuperUser).toBe(false);
        expect(ctx().isRealSuperUser).toBe(false);
    });

    it('флаг реального пользователя без viewAs — суперпользователь', () => {
        const { store, ctx } = makeStore();
        store.dispatch(appActions.setRealSuperUser(true));
        expect(ctx().isSuperUser).toBe(true);
        expect(ctx().isRealSuperUser).toBe(true);
        expect(checkAccess(EAccessFeature.VIEW_AS, ctx())).toBe(true);
        expect(checkAccess(EAccessFeature.SHARE_LINKS, ctx())).toBe(true);
    });

    it('в viewAs бонус гасится, VIEW_AS остаётся (иначе не выйти)', () => {
        const { store, ctx } = makeStore(currentUser({}));
        store.dispatch(appActions.setRealSuperUser(true));
        store.dispatch(appActions.setViewAsUser(VIEWED_USER));
        expect(ctx().isSuperUser).toBe(false);
        expect(ctx().isRealSuperUser).toBe(true);
        expect(ctx().isViewAs).toBe(true);
        expect(checkAccess(EAccessFeature.VIEW_AS, ctx())).toBe(true);
        expect(checkAccess(EAccessFeature.SHARE_LINKS, ctx())).toBe(false);
        expect(checkAccess(EAccessFeature.FINANCE_TAB, ctx())).toBe(false);
    });

    it('флаг в department.currentUser (снимок ссылки) прав не даёт', () => {
        const { ctx } = makeStore(currentUser({ isSuperUser: true }));
        expect(ctx().isSuperUser).toBe(false);
        expect(ctx().isRealSuperUser).toBe(false);
    });

    it('сразу после выхода из viewAs (структура ещё чужая) — флаг из app', () => {
        const { store, ctx } = makeStore(currentUser({ isSuperUser: false }));
        store.dispatch(appActions.setRealSuperUser(true));
        store.dispatch(appActions.setViewAsUser(VIEWED_USER));
        store.dispatch(appActions.setViewAsUser(null));
        expect(ctx().isSuperUser).toBe(true);
        expect(ctx().isViewAs).toBe(false);
    });

    it('роль и периметр — из структуры эффективного пользователя', () => {
        const { ctx } = makeStore(
            currentUser({ headOf: 'op', visibility: 'department' }),
        );
        expect(ctx().headOf).toBe('op');
        expect(ctx().isSelf).toBe(false);
    });
});

describe('selectAccessContext — портальный уровень для рядовых (portal_default)', () => {
    const lifted = () =>
        makeStore(
            currentUser({
                headOf: null,
                visibility: 'group',
                headOfDepartmentIds: [11],
                headOfSource: 'portal_default',
            }),
        );

    it('остаётся рядовым: isSelf, фичи руководителя закрыты', () => {
        const { ctx } = lifted();
        expect(ctx().headOf).toBeNull();
        expect(ctx().isSelf).toBe(true);
        expect(checkAccess(EAccessFeature.FINANCE_TAB, ctx())).toBe(false);
        expect(checkAccess(EAccessFeature.AIRTIME_TEAM, ctx())).toBe(false);
        expect(checkAccess(EAccessFeature.PLANS_VIEW_ALL, ctx())).toBe(false);
        expect(checkAccess(EAccessFeature.PLANS_CONFIGURE, ctx())).toBe(false);
        expect(checkAccess(EAccessFeature.AI_VIEW_ALL, ctx())).toBe(false);
        expect(checkAccess(EAccessFeature.AI_CONFIGURE, ctx())).toBe(false);
    });

    it('AI_TAB — только в режиме self-view, как у обычного менеджера', () => {
        const { store, ctx } = lifted();
        store.dispatch(
            appActions.setFeatures({
                aiAnalytics: true,
                aiAnalyticsPortalEnabled: true,
                aiAnalyticsSelfViewEnabled: false,
            }),
        );
        expect(checkAccess(EAccessFeature.AI_TAB, ctx())).toBe(false);

        store.dispatch(
            appActions.setFeatures({ aiAnalyticsSelfViewEnabled: true }),
        );
        expect(checkAccess(EAccessFeature.AI_TAB, ctx())).toBe(true);
    });
});
