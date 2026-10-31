import type { OfferWordByTemplateGenerateDto } from '@workspace/nest-konstructor-api';

/** Формат КП: по Word-шаблону пользователя или PDF из встроенного шаблона. */
export const OFFER_DOCUMENT_FORMAT = {
    WORD: 'word',
    PDF: 'pdf',
} as const;
export type OfferDocumentFormat =
    (typeof OFFER_DOCUMENT_FORMAT)[keyof typeof OFFER_DOCUMENT_FORMAT];

/** Сколько описания наполнения печатать — как в старой версии. */
export const OFFER_PDF_DESCRIPTION_MODE = {
    NO: 'no',
    SMALL: 'small',
    MEDIUM: 'medium',
    BIG: 'big',
} as const;
export type OfferPdfDescriptionMode =
    (typeof OFFER_PDF_DESCRIPTION_MODE)[keyof typeof OFFER_PDF_DESCRIPTION_MODE];

export const OFFER_PDF_VIEW_MODE = {
    LIST: 'list',
    TABLE: 'table',
    TABLE_WITH_GROUP: 'tableWithGroup',
} as const;
export type OfferPdfViewMode = (typeof OFFER_PDF_VIEW_MODE)[keyof typeof OFFER_PDF_VIEW_MODE];

export const OFFER_PDF_DESCRIPTION_MODE_OPTIONS: Array<{ value: OfferPdfDescriptionMode; label: string }> = [
    { value: OFFER_PDF_DESCRIPTION_MODE.NO, label: 'Нет — только названия' },
    { value: OFFER_PDF_DESCRIPTION_MODE.SMALL, label: 'Мало' },
    { value: OFFER_PDF_DESCRIPTION_MODE.MEDIUM, label: 'Средне' },
    { value: OFFER_PDF_DESCRIPTION_MODE.BIG, label: 'Много' },
];

export const OFFER_PDF_VIEW_MODE_OPTIONS: Array<{ value: OfferPdfViewMode; label: string }> = [
    { value: OFFER_PDF_VIEW_MODE.LIST, label: 'Список' },
    { value: OFFER_PDF_VIEW_MODE.TABLE, label: 'Таблица' },
    { value: OFFER_PDF_VIEW_MODE.TABLE_WITH_GROUP, label: 'Таблица с разделами' },
];

export interface OfferPdfSettings {
    descriptionMode: OfferPdfDescriptionMode;
    viewMode: OfferPdfViewMode;
    withStamps: boolean;
    withManager: boolean;
    isPriceFirst: boolean;
    salePhrase: string;
}

export const OFFER_PDF_DEFAULT_SETTINGS: OfferPdfSettings = {
    descriptionMode: OFFER_PDF_DESCRIPTION_MODE.SMALL,
    viewMode: OFFER_PDF_VIEW_MODE.LIST,
    withStamps: true,
    withManager: true,
    isPriceFirst: false,
    salePhrase: '',
};

/** Письмо: пустые поля — шаблон подставит свои. */
export interface OfferPdfLetter {
    appeal: string;
    text: string;
}

export const OFFER_PDF_EMPTY_LETTER: OfferPdfLetter = { appeal: '', text: '' };

/** Встроенный PDF-шаблон (GET /offer-pdf/templates). */
export interface OfferPdfTemplateInfo {
    code: string;
    name: string;
    description: string;
}

export const OFFER_PDF_DEFAULT_TEMPLATE_CODE = 'classic';

/** Ответ POST /offer-pdf/generate. */
export interface OfferPdfGenerateResponse {
    /** Ссылка на файл на нашем сервере */
    link: string;
    fileName: string;
    templateCode: string;
    durationMs: number;
    size: number;
    /** Файл загружен на Диск Битрикса и упомянут в таймлайне сделки */
    savedToDeal: boolean;
    /** Ссылка на файл в Битриксе; пусто — загрузка не удалась */
    bitrixLink: string | null;
    /** Почему к сделке не прикрепили; пусто — прикреплён */
    dealMessage: string | null;
}

/** Поля Word-запроса, которых у PDF-генерации нет. */
export const OFFER_PDF_OMITTED_WORD_FIELDS = [
    'templateId',
    'invoiceTemplateId',
    'invoice',
    'isWord',
    'withoutQueue',
    'onlyBitrixSave',
] as const;
export type OfferPdfOmittedWordField = (typeof OFFER_PDF_OMITTED_WORD_FIELDS)[number];

/**
 * Запрос КП в PDF: данные те же, что для Word-шаблона (бэк считает их
 * одним кодом), плюс код шаблона, настройки, письмо и номер.
 */
export type OfferPdfGenerateRequest = Omit<OfferWordByTemplateGenerateDto, OfferPdfOmittedWordField> & {
    templateCode: string;
    settings: {
        descriptionMode: OfferPdfDescriptionMode;
        viewMode: OfferPdfViewMode;
        withStamps: boolean;
        withManager: boolean;
        isPriceFirst: boolean;
        salePhrase: string | null;
    };
    letter?: { appeal?: string; text?: string };
    documentNumber?: string;
};

/** Что менеджер выбрал в прошлый раз — хранится в браузере. */
export interface OfferPdfDocumentPrefs {
    format: OfferDocumentFormat;
    templateCode: string;
    settings: OfferPdfSettings;
    letter: OfferPdfLetter;
    documentNumber: string;
}
