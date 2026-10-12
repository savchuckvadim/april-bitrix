import { describe, expect, it } from 'vitest';
import {
    formatDepartmentUser,
    mergeUserSelection,
    sortDepartmentUsers,
} from './word-template-user-selection';
import type {
    IUserSelectedTemplateSummary,
    IWordTemplateSummury,
} from '../../model';

const template = (id: string): IWordTemplateSummury =>
    ({ id, name: `t${id}` }) as unknown as IWordTemplateSummury;

const selection = (
    templateId: number,
    flags: Partial<Pick<IUserSelectedTemplateSummary, 'is_current' | 'is_favorite' | 'is_active'>>,
): IUserSelectedTemplateSummary => ({
    id: 1,
    bitrix_user_id: 55,
    portal_id: 7,
    template_id: templateId,
    is_current: false,
    is_favorite: false,
    is_active: false,
    ...flags,
});

describe('mergeUserSelection', () => {
    it('соединяет выбор с шаблоном по id, сравнивая как строки', () => {
        const rows = mergeUserSelection(
            [template('10'), template('20')],
            [selection(20, { is_current: true, is_favorite: true })],
        );
        const [first, second] = rows;
        expect(first?.selection).toBeNull();
        expect(first?.isCurrent).toBe(false);
        expect(second?.isCurrent).toBe(true);
        expect(second?.isFavorite).toBe(true);
        expect(second?.isActive).toBe(false);
    });

    it('порядок шаблонов сохраняется, выбор без шаблона игнорируется', () => {
        const rows = mergeUserSelection(
            [template('2'), template('1')],
            [selection(99, { is_current: true })],
        );
        expect(rows.map((r) => r.template.id)).toEqual(['2', '1']);
        expect(rows.every((r) => r.selection === null)).toBe(true);
    });
});

describe('formatDepartmentUser', () => {
    it('Фамилия Имя (email)', () => {
        expect(
            formatDepartmentUser({ ID: '1', NAME: 'Иван', LAST_NAME: 'Петров', EMAIL: 'i@x.ru' }),
        ).toBe('Петров Иван (i@x.ru)');
    });

    it('без фамилии и email — только имя', () => {
        expect(formatDepartmentUser({ ID: '1', NAME: 'Иван' })).toBe('Иван');
    });

    it('без имени — подпись по id, чтобы селект не показывал пустоту', () => {
        expect(formatDepartmentUser({ ID: '42', NAME: '' })).toBe('Пользователь #42');
    });
});

describe('sortDepartmentUsers', () => {
    it('сортирует по подписи и не мутирует вход', () => {
        const input = [
            { ID: '1', NAME: 'Яна' },
            { ID: '2', NAME: 'Анна' },
        ];
        const sorted = sortDepartmentUsers(input);
        expect(sorted.map((u) => u.NAME)).toEqual(['Анна', 'Яна']);
        expect(input.map((u) => u.NAME)).toEqual(['Яна', 'Анна']);
    });
});
