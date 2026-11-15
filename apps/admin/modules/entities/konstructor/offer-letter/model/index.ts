/**
 * Письма КП: перенос письма портала из легаси-шаблонов в `offer_letters`.
 * Формы описаны руками, пока ручка не попала в `@workspace/nest-admin-api`
 * (`pnpm run generate`): после генерации меняются только эти алиасы и helper.
 */

export const OFFER_LETTER_IMPORT_STATUS = {
    WOULD_CREATE: 'would-create',
    CREATED: 'created',
    EXISTS: 'exists',
    EMPTY: 'empty',
} as const;

export type OfferLetterImportStatus =
    (typeof OFFER_LETTER_IMPORT_STATUS)[keyof typeof OFFER_LETTER_IMPORT_STATUS];

export interface OfferLettersImportRequest {
    /** true — только показать, что будет перенесено */
    dryRun: boolean;
}

export interface OfferLetterImportItem {
    portalId: number;
    domain: string;
    legacyFieldId: number;
    length: number;
    /** Было ли письмо включено в легаси (`isLetter`) */
    enabled: boolean;
    /** Станет письмом портала по умолчанию */
    isDefault: boolean;
    status: OfferLetterImportStatus;
}

export interface OfferLettersImportResponse {
    dryRun: boolean;
    created: number;
    items: OfferLetterImportItem[];
}
