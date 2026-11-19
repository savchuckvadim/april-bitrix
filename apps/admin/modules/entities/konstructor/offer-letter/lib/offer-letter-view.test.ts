import { describe, expect, it } from 'vitest';
import {
    OFFER_LETTER_IMPORT_STATUS,
    OFFER_LETTER_SCOPE,
    type OfferLetter,
    type OfferLetterImportItem,
} from '../model';
import {
    filterOfferLetters,
    offerLetterDefaultHint,
    offerLetterOwnerLabel,
    offerLettersImportSummary,
} from './offer-letter-view';

const offerLetter = (overrides: Partial<OfferLetter> = {}): OfferLetter => ({
    id: 'letter-1',
    portalId: 12,
    bxUserId: null,
    name: 'Письмо',
    text: 'Текст',
    isDefault: false,
    isActive: true,
    sort: 0,
    createdAt: null,
    updatedAt: null,
    ...overrides,
});

describe('таблица писем КП', () => {
    const portalLetter = offerLetter({ id: 'a' });
    const personalLetter = offerLetter({ id: 'b', bxUserId: 1480 });

    it('фильтр «чьи» оставляет письма портала или личные, порядок не меняется', () => {
        const all = [portalLetter, personalLetter];
        expect(filterOfferLetters(all, OFFER_LETTER_SCOPE.ALL)).toEqual(all);
        expect(filterOfferLetters(all, OFFER_LETTER_SCOPE.PORTAL)).toEqual([portalLetter]);
        expect(filterOfferLetters(all, OFFER_LETTER_SCOPE.PERSONAL)).toEqual([personalLetter]);
    });

    it('владелец: портал, имя менеджера или его id, если имени нет', () => {
        const names = new Map([[1480, 'Иванов Иван']]);
        expect(offerLetterOwnerLabel(portalLetter, names, 'Портал')).toBe('Портал');
        expect(offerLetterOwnerLabel(personalLetter, names, 'Портал')).toBe('Иванов Иван');
        expect(offerLetterOwnerLabel(offerLetter({ bxUserId: 7 }), names, 'Портал')).toBe(
            'Менеджер id 7',
        );
    });

    it('назначить по умолчанию нельзя письмо, которое уже по умолчанию, и выключенное', () => {
        expect(offerLetterDefaultHint(offerLetter())).toBeUndefined();
        expect(offerLetterDefaultHint(offerLetter({ isDefault: true }))).toContain('другого письма');
        expect(offerLetterDefaultHint(offerLetter({ isActive: false }))).toContain('Выключенное');
    });
});

const item = (status: OfferLetterImportItem['status']): OfferLetterImportItem => ({
    portalId: 1,
    domain: 'april-garant.bitrix24.ru',
    legacyFieldId: 2,
    length: 967,
    enabled: true,
    isDefault: true,
    status,
});

describe('сводка переноса писем', () => {
    it('проверка считает, сколько будет перенесено', () => {
        expect(
            offerLettersImportSummary({
                dryRun: true,
                created: 0,
                items: [
                    item(OFFER_LETTER_IMPORT_STATUS.WOULD_CREATE),
                    item(OFFER_LETTER_IMPORT_STATUS.EXISTS),
                ],
            }),
        ).toBe('Проверка: найдено писем — 2, будет перенесено — 1. Ничего не записано.');
    });

    it('перенос показывает созданные по ответу ручки', () => {
        expect(
            offerLettersImportSummary({
                dryRun: false,
                created: 1,
                items: [item(OFFER_LETTER_IMPORT_STATUS.CREATED)],
            }),
        ).toBe('Перенос: найдено писем — 1, перенесено — 1.');
    });

    it('пусто — так и говорит', () => {
        expect(offerLettersImportSummary({ dryRun: true, created: 0, items: [] })).toBe(
            'Писем в легаси-шаблонах не найдено.',
        );
    });
});
