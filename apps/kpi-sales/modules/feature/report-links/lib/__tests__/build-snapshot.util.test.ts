import { describe, expect, it } from 'vitest';
import type { BXUser } from '@workspace/bx';
import type { RootState } from '@/modules/app/model/store';
import type { CurrentUserInfo } from '@/modules/entities/department/model';
import { checkAccess, EAccessFeature } from '@/modules/shared/access';
import { APP_FEATURES } from '@/modules/app/consts/features';
import { buildShareFilterSnapshot } from '../build-snapshot.util';
import type { ShareUiBlob } from '../../model/share-ui-blob';

/*
 * Снимок публичной ссылки: роль суперпользователя вендора сбрасывается до
 * прежней «без роли» — /share выглядит как раньше (без «Финансов»).
 * Периметр создателя (visibleUsers, defaultSelected) остаётся в снимке.
 */

const USERS = [{ ID: 1 }, { ID: 2 }] as unknown as BXUser[];

const currentUser = (overrides: Partial<CurrentUserInfo>): CurrentUserInfo => ({
    userId: 99,
    isHead: false,
    headOf: null,
    headOfDepartmentIds: [],
    visibility: 'own',
    headOfSource: 'structure',
    isSuperUser: false,
    colleagues: { group: [], department: [] },
    ...overrides,
});

const SUPER_USER = currentUser({
    headOf: 'cup',
    headOfDepartmentIds: [10, 20],
    visibility: 'all',
    headOfSource: 'superuser',
    isSuperUser: true,
});

/** Минимальный стор создателя ссылки: то, что читает снимок. */
const makeState = (cu: CurrentUserInfo | null): RootState =>
    ({
        department: {
            isMulti: true,
            multipleTag: 'ОП',
            departments: [],
            currentUser: cu,
            items: USERS,
            current: USERS,
            groups: { items: [], current: [] },
            isHeadManager: true,
        },
        report: {
            date: { from: '2026-09-01', to: '2026-09-25' },
            filter: [],
        },
        reportType: { current: 'kpi' },
        mergedReport: { selectedUsers: [], selectedActions: [] },
        conversions: { widget: {} },
    }) as unknown as RootState;

const uiOf = (state: RootState): ShareUiBlob =>
    buildShareFilterSnapshot(state).ui as unknown as ShareUiBlob;

/** Права зрителя /share: флага суперпользователя в app нет. */
const publicFinanceTab = (cu: CurrentUserInfo | null): boolean =>
    checkAccess(EAccessFeature.FINANCE_TAB, {
        features: APP_FEATURES,
        headOf: cu?.headOf ?? null,
        isSuperUser: false,
        isRealSuperUser: false,
        isViewAs: false,
        isMulti: true,
        isSelf: cu?.visibility === 'own',
    });

describe('buildShareFilterSnapshot — роль в снимке', () => {
    it('суперпользователь: роль сброшена, «Финансы» на /share скрыты', () => {
        const shared = uiOf(makeState(SUPER_USER)).department.currentUser;
        expect(shared).toMatchObject({
            userId: 99,
            isSuperUser: false,
            headOf: null,
            visibility: 'own',
            headOfSource: 'structure',
        });
        expect(publicFinanceTab(shared)).toBe(false);
        // Без нормализации роль cup от бэка открыла бы публике «Финансы».
        expect(publicFinanceTab(SUPER_USER)).toBe(true);
    });

    it('периметр создателя в снимке не меняется', () => {
        const department = uiOf(makeState(SUPER_USER)).department;
        expect(department.visibleUsers).toBe(USERS);
        expect(department.defaultSelected).toBe(USERS);
        expect(department.isHeadManager).toBe(true);
    });

    it('руководитель портала — роль как есть', () => {
        const head = currentUser({ headOf: 'op', visibility: 'department' });
        const shared = uiOf(makeState(head)).department.currentUser;
        expect(shared).toEqual(head);
    });

    it('структуры нет — currentUser null', () => {
        expect(uiOf(makeState(null)).department.currentUser).toBeNull();
    });

    it('фильтры отчёта — по выбранным сотрудникам', () => {
        const snapshot = buildShareFilterSnapshot(makeState(SUPER_USER));
        expect(snapshot.financeFilters).toMatchObject({ assignedIds: [1, 2] });
    });
});
