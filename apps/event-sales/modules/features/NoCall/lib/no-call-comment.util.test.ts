import { describe, expect, it } from 'vitest';
import {
    appendCommentLine,
    companyPhoneOptions,
    contactDisplayName,
    withContactName,
} from './no-call-comment.util';

/**
 * Хитрость легаси-меню недозвона: контакт и номер дописываются в комментарий,
 * смена контакта заменяет имя, снятие — убирает.
 */
describe('withContactName', () => {
    it('выбрали контакт — имя дописывается новой строкой', () => {
        expect(withContactName('Не дозвонились', null, 'Иванов Иван')).toBe(
            'Не дозвонились\nИванов Иван',
        );
        expect(withContactName('', null, 'Иванов Иван')).toBe('Иванов Иван');
    });

    it('сменили контакт — прежнее имя заменяется новым', () => {
        expect(
            withContactName('Не дозвонились\nИванов Иван', 'Иванов Иван', 'Петров Пётр'),
        ).toBe('Не дозвонились\nПетров Пётр');
    });

    it('сняли контакт — имя убирается, остальной текст цел', () => {
        expect(
            withContactName('Не дозвонились\nИванов Иван', 'Иванов Иван', null),
        ).toBe('Не дозвонились');
        expect(withContactName('Иванов Иван', 'Иванов Иван', null)).toBe('');
    });

    it('имя уже в тексте или менеджер его стёр — текст не трогаем', () => {
        expect(withContactName('Иванов Иван ждёт', null, 'Иванов Иван')).toBe(
            'Иванов Иван ждёт',
        );
        expect(withContactName('Своими словами', 'Иванов Иван', null)).toBe(
            'Своими словами',
        );
    });
});

describe('appendCommentLine / contactDisplayName / companyPhoneOptions', () => {
    it('номер дописывается новой строкой, пустой — нет', () => {
        expect(appendCommentLine('Секретарь', '+7 900 000-00-00')).toBe(
            'Секретарь\n+7 900 000-00-00',
        );
        expect(appendCommentLine('Секретарь', '  ')).toBe('Секретарь');
    });

    it('имя контакта — фамилия и имя; без имени — null', () => {
        expect(contactDisplayName({ NAME: 'Иван', LAST_NAME: 'Иванов' })).toBe(
            'Иванов Иван',
        );
        expect(contactDisplayName({ NAME: ' Иван ' })).toBe('Иван');
        expect(contactDisplayName({ NAME: '' })).toBeNull();
        expect(contactDisplayName(null)).toBeNull();
    });

    it('телефоны компании: множественное поле Битрикса, без пустых и дублей', () => {
        expect(
            companyPhoneOptions([
                { ID: '11', VALUE: '+79000000001', VALUE_TYPE: 'WORK' },
                { ID: '12', VALUE: '' },
                { ID: '13', VALUE: '+79000000001' },
                { VALUE: '+79000000002' },
            ]),
        ).toEqual([
            { id: '11', value: '+79000000001' },
            { id: '+79000000002', value: '+79000000002' },
        ]);
        expect(companyPhoneOptions('+79000000003')).toEqual([
            { id: '+79000000003', value: '+79000000003' },
        ]);
        expect(companyPhoneOptions(null)).toEqual([]);
    });
});
