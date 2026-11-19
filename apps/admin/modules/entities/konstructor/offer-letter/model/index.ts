/**
 * Письма КП: письма портала и личные письма менеджеров (`offer_letters`) и
 * временный перенос письма портала из легаси-шаблонов.
 *
 * Формы описаны руками, пока ручки не попали в `@workspace/nest-admin-api`
 * (`pnpm run generate`). Интерфейсы `*Dto` названы так же, как DTO бэка
 * (`apps/admin/src/konstructor/offer-letters/dto`): после генерации они
 * заменяются импортом из пакета, доменные алиасы ниже остаются.
 */

/** Ответ ручек `admin/konstructor/offer-letters`: одно письмо */
export interface OfferLetterResponseDto {
    id: string;
    portalId: number;
    /** null — письмо портала; задан — личное письмо менеджера (Bitrix-id) */
    bxUserId: number | null;
    name: string;
    /** Текст с разметкой `<color>`, `<bold>`, `<red>`; абзацы — перевод строки */
    text: string;
    /** Письмо по умолчанию своей области; в области оно одно */
    isDefault: boolean;
    isActive: boolean;
    sort: number;
    createdAt: string | null;
    updatedAt: string | null;
}

export interface CreateOfferLetterDto {
    portalId: number;
    /** Не указан или null — письмо портала */
    bxUserId?: number | null;
    name: string;
    text: string;
    isDefault?: boolean;
    isActive?: boolean;
    sort?: number;
}

/** Портал, менеджер и «по умолчанию» не правятся: для них своя ручка */
export interface UpdateOfferLetterDto {
    name?: string;
    text?: string;
    isActive?: boolean;
    sort?: number;
}

export interface OfferLetterDeletedDto {
    id: string;
}

export type OfferLetter = OfferLetterResponseDto;
export type OfferLetterCreate = CreateOfferLetterDto;
export type OfferLetterUpdate = UpdateOfferLetterDto;
export type OfferLetterDeleted = OfferLetterDeletedDto;

/** Теги разметки текста письма; их понимают рендеры PDF-КП и Word */
export const OFFER_LETTER_TAG = {
    COLOR: 'color',
    BOLD: 'bold',
    RED: 'red',
} as const;

export type OfferLetterTag = (typeof OFFER_LETTER_TAG)[keyof typeof OFFER_LETTER_TAG];

/** Кусок абзаца с одним стилем; `tag: null` — обычный текст */
export interface OfferLetterRun {
    text: string;
    tag: OfferLetterTag | null;
}

/** Чьи письма показывает таблица */
export const OFFER_LETTER_SCOPE = {
    ALL: 'all',
    PORTAL: 'portal',
    PERSONAL: 'personal',
} as const;

export type OfferLetterScopeFilter =
    (typeof OFFER_LETTER_SCOPE)[keyof typeof OFFER_LETTER_SCOPE];

/** Значения формы письма (строки и флаги, как в полях ввода) */
export interface OfferLetterFormValues {
    name: string;
    text: string;
    /** Личное письмо менеджера; у существующего письма область не меняется */
    isPersonal: boolean;
    /** Bitrix-id менеджера; 0 — не выбран */
    bxUserId: number;
    isActive: boolean;
    isDefault: boolean;
    /** Порядок строкой: поле ввода может быть пустым */
    sort: string;
}

export type OfferLetterFormErrors = Partial<
    Record<'name' | 'text' | 'bxUserId' | 'sort', string>
>;

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
