import { describe, expect, it } from 'vitest';
import type { BXUser } from '@workspace/bx';
import {
    type CachedDepartment,
    getDepartmentCacheKey,
    isCachedDepartment,
    sameDepartment,
} from './department-cache';

const user = (id: number, name: string): BXUser =>
    ({ ID: String(id), NAME: name }) as unknown as BXUser;

const department = (users: BXUser[]): CachedDepartment => ({
    users,
    structure: { general: [], children: [], parents: [] },
});

describe('отдел в кэше браузера', () => {
    it('ключ — по порталу: отдел общий для всех его сотрудников', () => {
        expect(getDepartmentCacheKey('garant.bitrix24.ru')).toEqual({
            name: 'event-sales:sales-department',
            domain: 'garant.bitrix24.ru',
            version: 1,
        });
    });

    it('принимает запись своей формы, в том числе без структуры', () => {
        expect(isCachedDepartment(department([user(1, 'Анна')]))).toBe(true);
        expect(
            isCachedDepartment({ users: [user(1, 'Анна')], structure: null }),
        ).toBe(true);
    });

    it('чужую или битую запись не принимает — тогда идём в сеть', () => {
        expect(isCachedDepartment(null)).toBe(false);
        expect(isCachedDepartment({ users: 'x' })).toBe(false);
        expect(isCachedDepartment({ users: [{ NAME: 'без ID' }] })).toBe(
            false,
        );
        expect(
            isCachedDepartment({ users: [], structure: { general: 1 } }),
        ).toBe(false);
    });

    it('тот же отдел — обновлять нечего; новый сотрудник — обновляем', () => {
        const before = department([user(1, 'Анна')]);
        expect(sameDepartment(before, department([user(1, 'Анна')]))).toBe(
            true,
        );
        expect(
            sameDepartment(
                before,
                department([user(1, 'Анна'), user(2, 'Пётр')]),
            ),
        ).toBe(false);
    });
});
