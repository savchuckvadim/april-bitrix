import { describe, expect, it } from 'vitest';
import { BXDepartment, BXUser } from '@workspace/bx';
import {
    EDepartmentRole,
    resolveDepartmentRole,
} from './department-role-util';
import { DepartmentStructureState } from '../type/department-type';

/**
 * Дерево: 1 «Компания» (head 900) → 3 «Продажи» (head 100) → 7 «Группа ХО»
 * (head 200). Сотрудник 300 сидит в группе 7 вместе с 301.
 */
const dep = (
    id: number,
    parent: number,
    head: number | string | null,
    users: number[] = [],
): BXDepartment =>
    ({
        ID: id,
        NAME: `dep-${id}`,
        PARENT: String(parent),
        SORT: 100,
        UF_HEAD: head,
        USERS: users.map(uid => user(uid, [id])),
    }) as unknown as BXDepartment;

const user = (id: number, departments: number[]): BXUser =>
    ({
        ID: String(id),
        NAME: `user-${id}`,
        UF_DEPARTMENT: departments,
    }) as unknown as BXUser;

const structure: DepartmentStructureState = {
    general: [dep(3, 1, 100, [100])],
    children: [dep(7, 3, 200, [200, 300, 301])],
    parents: [dep(1, 0, 900, [900])],
};

const allUsers: BXUser[] = [
    user(100, [3]),
    user(200, [7]),
    user(300, [7]),
    user(301, [7]),
];

const resolve = (userId: number, bossId = 0) =>
    resolveDepartmentRole({ userId, bossId, structure, allUsers });

describe('resolveDepartmentRole', () => {
    it('обычный сотрудник: EMPLOYEE, руководитель — head его группы', () => {
        const info = resolve(300);
        expect(info.role).toBe(EDepartmentRole.EMPLOYEE);
        expect(info.headId).toBe(200);
        expect(info.colleagueIds.sort()).toEqual([200, 301]);
    });

    it('руководитель группы: GROUP_HEAD, его head — из родительской цепочки', () => {
        const info = resolve(200);
        expect(info.role).toBe(EDepartmentRole.GROUP_HEAD);
        // Сам head своей группы → подъём: head отдела «Продажи» (100).
        expect(info.headId).toBe(100);
    });

    it('руководитель отдела: DEPARTMENT_HEAD, head — из компании', () => {
        const info = resolve(100);
        expect(info.role).toBe(EDepartmentRole.DEPARTMENT_HEAD);
        expect(info.headId).toBe(900);
    });

    it('head родительского отдела и bossId → SUPER', () => {
        expect(resolve(900).role).toBe(EDepartmentRole.SUPER);
        expect(resolve(555, 555).role).toBe(EDepartmentRole.SUPER);
    });

    it('человек вне поддерева продаж → SUPER (директор на чужой карточке)', () => {
        expect(resolve(777).role).toBe(EDepartmentRole.SUPER);
    });

    it('UF_HEAD строкой нормализуется', () => {
        const stringHeads: DepartmentStructureState = {
            general: [dep(3, 1, '100')],
            children: [],
            parents: [],
        };
        const info = resolveDepartmentRole({
            userId: 100,
            bossId: 0,
            structure: stringHeads,
            allUsers: [user(100, [3])],
        });
        expect(info.role).toBe(EDepartmentRole.DEPARTMENT_HEAD);
    });

    it('без head в цепочке падаем на bossId, без bossId — null', () => {
        const headless: DepartmentStructureState = {
            general: [dep(3, 0, null)],
            children: [],
            parents: [],
        };
        const input = {
            userId: 300,
            structure: headless,
            allUsers: [user(300, [3])],
        };
        expect(
            resolveDepartmentRole({ ...input, bossId: 42 }).headId,
        ).toBe(42);
        expect(resolveDepartmentRole({ ...input, bossId: 0 }).headId).toBe(
            null,
        );
    });
});
