import { describe, expect, it } from 'vitest';
import { OFFER_LETTER_IMPORT_STATUS, type OfferLetterImportItem } from '../model';
import { offerLettersImportSummary } from './offer-letter-view';

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
