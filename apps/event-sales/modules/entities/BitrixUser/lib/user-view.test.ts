import { describe, expect, it } from 'vitest';
import { mapPortalUser, userDisplayName } from './user-view';

describe('userDisplayName', () => {
    it('склеивает имя и фамилию', () => {
        expect(
            userDisplayName({ ID: 447, NAME: 'Вадим', LAST_NAME: 'Савчук' }),
        ).toBe('Вадим Савчук');
    });

    it('без имени подписывает номером — пустое место читается как сбой', () => {
        expect(userDisplayName({ ID: '447' })).toBe('Сотрудник 447');
        expect(userDisplayName(null, 447)).toBe('Сотрудник 447');
        expect(userDisplayName(null)).toBe('Сотрудник');
    });
});

describe('mapPortalUser', () => {
    it('берёт должность и чистит пробелы', () => {
        expect(
            mapPortalUser({
                ID: '12',
                NAME: 'Анна',
                LAST_NAME: 'Петрова',
                WORK_POSITION: '  Менеджер  ',
            }),
        ).toEqual({ id: 12, name: 'Анна Петрова', position: 'Менеджер' });
    });

    it('без id пользователя нет', () => {
        expect(mapPortalUser({ NAME: 'Аноним' })).toBeNull();
        expect(mapPortalUser(null)).toBeNull();
    });
});
