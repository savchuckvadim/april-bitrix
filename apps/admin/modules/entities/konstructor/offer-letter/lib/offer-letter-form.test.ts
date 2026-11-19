import { describe, expect, it } from 'vitest';
import type { OfferLetter, OfferLetterFormValues } from '../model';
import {
    emptyOfferLetterForm,
    offerLetterToForm,
    parseOfferLetterSort,
    toOfferLetterCreate,
    toOfferLetterUpdate,
    validateOfferLetterForm,
} from './offer-letter-form';

const filled = (overrides: Partial<OfferLetterFormValues> = {}): OfferLetterFormValues => ({
    ...emptyOfferLetterForm(),
    name: 'Письмо',
    text: 'Добрый день!',
    ...overrides,
});

const letter = (overrides: Partial<OfferLetter> = {}): OfferLetter => ({
    id: 'letter-1',
    portalId: 12,
    bxUserId: null,
    name: 'Письмо портала',
    text: 'Раз\\nДва',
    isDefault: true,
    isActive: true,
    sort: 5,
    createdAt: null,
    updatedAt: null,
    ...overrides,
});

describe('форма письма КП', () => {
    it('заполненная форма письма портала ошибок не даёт', () => {
        expect(validateOfferLetterForm(filled())).toEqual({});
    });

    it('название и текст обязательны, пробелы не считаются', () => {
        expect(validateOfferLetterForm(filled({ name: '  ', text: ' \n ' }))).toEqual({
            name: 'Введите название письма.',
            text: 'Введите текст письма.',
        });
    });

    it('слишком длинные название и текст отклоняются', () => {
        const errors = validateOfferLetterForm(
            filled({ name: 'я'.repeat(256), text: 'я'.repeat(5001) }),
        );
        expect(errors.name).toContain('255');
        expect(errors.text).toContain('5000');
    });

    it('ошибка разметки попадает в поле текста', () => {
        expect(validateOfferLetterForm(filled({ text: '<red>без конца' })).text).toBe(
            'Не закрыт тег <red>.',
        );
    });

    it('личное письмо требует менеджера', () => {
        expect(validateOfferLetterForm(filled({ isPersonal: true })).bxUserId).toBe(
            'Выберите менеджера.',
        );
        expect(validateOfferLetterForm(filled({ isPersonal: true, bxUserId: 1480 }))).toEqual({});
    });

    it('порядок — целое от нуля в пределах', () => {
        expect(parseOfferLetterSort('')).toBe(0);
        expect(parseOfferLetterSort(' 15 ')).toBe(15);
        expect(parseOfferLetterSort('-1')).toBeNull();
        expect(parseOfferLetterSort('1.5')).toBeNull();
        expect(parseOfferLetterSort('100001')).toBeNull();
        expect(parseOfferLetterSort('abc')).toBeNull();
        expect(validateOfferLetterForm(filled({ sort: 'abc' })).sort).toBeDefined();
    });

    it('создание: письмо портала уходит без менеджера, личное — с ним', () => {
        expect(toOfferLetterCreate(12, filled({ name: ' Письмо ', isDefault: true }))).toEqual({
            portalId: 12,
            bxUserId: null,
            name: 'Письмо',
            text: 'Добрый день!',
            isActive: true,
            isDefault: true,
            sort: 0,
        });
        expect(
            toOfferLetterCreate(12, filled({ isPersonal: true, bxUserId: 1480 })).bxUserId,
        ).toBe(1480);
    });

    it('правка не отправляет область и «по умолчанию»', () => {
        expect(toOfferLetterUpdate(filled({ sort: '7', isActive: false }))).toEqual({
            name: 'Письмо',
            text: 'Добрый день!',
            isActive: false,
            sort: 7,
        });
    });

    it('письмо из базы открывается с обычными переводами строк вместо литерала «\\n»', () => {
        expect(offerLetterToForm(letter())).toEqual({
            name: 'Письмо портала',
            text: 'Раз\nДва',
            isPersonal: false,
            bxUserId: 0,
            isActive: true,
            isDefault: true,
            sort: '5',
        });
        expect(offerLetterToForm(letter({ bxUserId: 1480 })).isPersonal).toBe(true);
    });
});
