import { describe, expect, it } from 'vitest';
import { toClientDto } from './client-form.values';

describe('форма клиента → DTO', () => {
    it('создание: название без пробелов, пустой email не отправляется', () => {
        expect(toClientDto({ name: '  Альфа-Центр ', email: '  ', isActive: true }, 'create')).toEqual({
            name: 'Альфа-Центр',
        });
    });

    it('правка: email и «действует»', () => {
        expect(toClientDto({ name: 'Альфа', email: ' a@b.ru ', isActive: false }, 'edit')).toEqual({
            name: 'Альфа',
            email: 'a@b.ru',
            is_active: false,
        });
    });
});
