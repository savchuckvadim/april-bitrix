import {
    OFFER_LETTER_IMPORT_STATUS,
    type OfferLetterImportStatus,
} from '../model';

/** Временная ручка переноса писем: после переноса удаляется вместе с кнопкой */
export const OFFER_LETTERS_IMPORT_URL =
    '/api/admin/maintenance/offer-letters/import-legacy';

export const OFFER_LETTER_IMPORT_STATUS_LABEL: Record<OfferLetterImportStatus, string> = {
    [OFFER_LETTER_IMPORT_STATUS.WOULD_CREATE]: 'Будет перенесено',
    [OFFER_LETTER_IMPORT_STATUS.CREATED]: 'Перенесено',
    [OFFER_LETTER_IMPORT_STATUS.EXISTS]: 'Уже перенесено',
    [OFFER_LETTER_IMPORT_STATUS.EMPTY]: 'Пустое, пропущено',
};
