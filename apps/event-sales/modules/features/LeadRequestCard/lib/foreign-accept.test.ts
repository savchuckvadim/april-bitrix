import { describe, expect, it } from 'vitest';
import { findUserName, getForeignAcceptDescription } from './foreign-accept';

const users = [
    { ID: '445', NAME: 'Арина', LAST_NAME: 'Липунова' },
    { ID: 325, NAME: 'Саломе', LAST_NAME: '' },
];

describe('findUserName', () => {
    it('находит сотрудника по id, строки и числа одинаково', () => {
        expect(findUserName(users, 445)).toBe('Арина Липунова');
        expect(findUserName(users, 325)).toBe('Саломе');
    });

    it('нет в структуре или нет id — null', () => {
        expect(findUserName(users, 999)).toBeNull();
        expect(findUserName(users, null)).toBeNull();
        expect(findUserName([{ ID: 7 }], 7)).toBeNull();
    });
});

describe('getForeignAcceptDescription', () => {
    it('с именем — называет ответственного', () => {
        const text = getForeignAcceptDescription('Арина Липунова');
        expect(text.startsWith('Ответственный по заявке — Арина Липунова.')).toBe(
            true,
        );
        expect(text).toContain('сделка, заявка и задачи');
    });

    it('без имени — нейтральная фраза', () => {
        expect(
            getForeignAcceptDescription(null).startsWith(
                'Заявка назначена другому сотруднику.',
            ),
        ).toBe(true);
    });
});
