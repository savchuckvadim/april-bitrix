import { describe, expect, it } from 'vitest';
import type { BXUser } from '@workspace/bx';
import { computeDepartmentScope } from '../lib/utils/scope.util';
import type { CurrentUserInfo } from '../model';
import {
    ids,
    makeCurrentUser,
    makeDepartments,
    makeSuperUser,
} from './department-fixtures';

/*
 * Периметр считается ТОЛЬКО по уровню видимости с бэка: отдельного
 * параметра «суперпользователь» больше нет — бэк сам отдаёт ему 'all'.
 */

const APP_USER = { ID: 1, NAME: 'Я', LAST_NAME: 'Сам' } as unknown as BXUser;

describe('computeDepartmentScope', () => {
    it('all — вся структура, выбор по умолчанию — все группы', () => {
        const scope = computeDepartmentScope(
            makeDepartments(),
            makeCurrentUser({ visibility: 'all', headOf: 'cup' }),
            APP_USER,
        );
        expect(ids(scope.users)).toEqual([1, 2, 3, 4, 5, 6]);
        expect(ids(scope.groups)).toEqual([11, 12]);
        expect(scope.isHeadManager).toBe(true);
        expect(ids(scope.defaultSelected)).toEqual([1, 2, 3]);
    });

    it('суперпользователь вендора — вся структура по visibility all от бэка', () => {
        const scope = computeDepartmentScope(
            makeDepartments(),
            makeSuperUser(),
            APP_USER,
        );
        expect(ids(scope.users)).toEqual([1, 2, 3, 4, 5, 6]);
        expect(scope.isHeadManager).toBe(true);
    });

    it('department — только свои ОП', () => {
        const scope = computeDepartmentScope(
            makeDepartments(),
            makeCurrentUser({
                visibility: 'department',
                headOf: 'op',
                headOfDepartmentIds: [20],
            }),
            APP_USER,
        );
        expect(ids(scope.users)).toEqual([5, 6]);
        expect(scope.groups).toEqual([]);
        expect(ids(scope.defaultSelected)).toEqual([5, 6]);
        expect(scope.isHeadManager).toBe(true);
    });

    it('group — только свои группы', () => {
        const scope = computeDepartmentScope(
            makeDepartments(),
            makeCurrentUser({
                visibility: 'group',
                headOf: 'group',
                headOfDepartmentIds: [11],
            }),
            APP_USER,
        );
        expect(ids(scope.users)).toEqual([1, 2]);
        expect(ids(scope.groups)).toEqual([11]);
        expect(ids(scope.defaultSelected)).toEqual([1, 2]);
    });

    it('own — только сам менеджер из структуры', () => {
        const scope = computeDepartmentScope(
            makeDepartments(),
            makeCurrentUser({ userId: 3 }),
            APP_USER,
        );
        expect(ids(scope.users)).toEqual([3]);
        expect(scope.groups).toEqual([]);
        expect(scope.isHeadManager).toBe(false);
    });

    it('own вне структуры — фолбэк на пользователя приложения', () => {
        const scope = computeDepartmentScope(
            makeDepartments(),
            makeCurrentUser({ userId: 777 }),
            APP_USER,
        );
        expect(scope.users).toEqual([APP_USER]);
    });

    it('флаг isSuperUser без visibility all периметр не расширяет', () => {
        const scope = computeDepartmentScope(
            makeDepartments(),
            makeCurrentUser({ userId: 3, isSuperUser: true }),
            APP_USER,
        );
        expect(ids(scope.users)).toEqual([3]);
    });

    it('нет visibility (снимки v: 1) — уровень по headOf', () => {
        const legacy = {
            ...makeCurrentUser({ headOf: 'cup' }),
            visibility: undefined,
        } as unknown as CurrentUserInfo;
        const scope = computeDepartmentScope(
            makeDepartments(),
            legacy,
            APP_USER,
        );
        expect(ids(scope.users)).toEqual([1, 2, 3, 4, 5, 6]);
    });
});
