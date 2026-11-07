import { describe, expect, it } from 'vitest';
import {
    employeeHint,
    employeeName,
    formatEmployeeIds,
    parseEmployeeIds,
} from './employee-ids';

describe('employee-ids — значение настройки ↔ список сотрудников', () => {
    it('разбирает CSV, число и пусто; мусор, нули и дубли отбрасывает', () => {
        expect(parseEmployeeIds('447, 12;  12 abc 0 -3')).toEqual([447, 12]);
        expect(parseEmployeeIds(251)).toEqual([251]);
        expect(parseEmployeeIds(0)).toEqual([]);
        expect(parseEmployeeIds('')).toEqual([]);
        expect(parseEmployeeIds(null)).toEqual([]);
        expect(parseEmployeeIds(true)).toEqual([]);
    });

    it('собирает обратно через запятую', () => {
        expect(formatEmployeeIds([447, 12])).toBe('447, 12');
        expect(formatEmployeeIds([])).toBe('');
    });

    it('подпись — должность и первый отдел; имя по id или пометка «не найден»', () => {
        const employee = {
            id: 447,
            name: 'Савчук Вадим',
            position: 'Руководитель',
            departments: ['Отдел продаж', 'Сервис'],
        };
        expect(employeeHint(employee)).toBe('Руководитель · Отдел продаж');
        expect(
            employeeHint({ ...employee, position: null, departments: [] }),
        ).toBeUndefined();
        const byId = new Map([[447, employee]]);
        expect(employeeName(447, byId)).toBe('Савчук Вадим');
        expect(employeeName(9, byId)).toBe('id 9 (не найден)');
    });
});
