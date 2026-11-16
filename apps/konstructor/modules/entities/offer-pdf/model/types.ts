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
    /** Титульный лист — у стилей, где он есть */
    withCover: boolean;
    /** Страница о системе или о сервисе — у стилей, где она есть */
    withPromo: boolean;
}

export const OFFER_PDF_DEFAULT_SETTINGS: OfferPdfSettings = {
    descriptionMode: OFFER_PDF_DESCRIPTION_MODE.SMALL,
    viewMode: OFFER_PDF_VIEW_MODE.LIST,
    withStamps: true,
    withManager: true,
    isPriceFirst: false,
    salePhrase: '',
    withCover: true,
    withPromo: true,
};

/** Письмо: пустые поля — шаблон подставит свои. */
export interface OfferPdfLetter {
    appeal: string;
    text: string;
}

export const OFFER_PDF_EMPTY_LETTER: OfferPdfLetter = { appeal: '', text: '' };

/** Гамма стиля: та же вёрстка в другом цвете */
export interface OfferPdfPaletteInfo {
    code: string;
    name: string;
    /** Цвет кружка в выборе */
    swatch: string;
}

/**
 * Встроенный PDF-стиль (GET /offer-pdf/templates). Титульник, промо и гаммы
 * бэк отдаёт с выкладки 16.11 — до неё полей нет, отсюда необязательность.
 */
export interface OfferPdfTemplateInfo {
    code: string;
    name: string;
    description: string;
    hasCover?: boolean;
    hasPromo?: boolean;
    /** Первая — по умолчанию; пусто — у стиля одна гамма */
    palettes?: OfferPdfPaletteInfo[];
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
    /**
     * Картинки и логотипы стиля, которых нет на сервере: документ собран без
     * них. Бэк отдаёт поле с выкладки 16.11 — до неё его нет.
     */
    missingAssets?: string[];
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
    /** Гамма стиля; не задана — первая */
    palette?: string;
    settings: {
        descriptionMode: OfferPdfDescriptionMode;
        viewMode: OfferPdfViewMode;
        withStamps: boolean;
        withManager: boolean;
        isPriceFirst: boolean;
        salePhrase: string | null;
        withCover: boolean;
        withPromo: boolean;
    };
    letter?: { appeal?: string; text?: string };
    documentNumber?: string;
};

/** Настройки КП на экране документа; у сделки и варианта уходят в слепок целиком. */
export interface OfferPdfDocumentPrefs {
    format: OfferDocumentFormat;
    templateCode: string;
    /** Гамма стиля; null — первая гамма стиля */
    palette: string | null;
    settings: OfferPdfSettings;
    letter: OfferPdfLetter;
    documentNumber: string;
}

/** Стиль без данных сделки — последний выбор менеджера (app_cache, копия в браузере) */
export type OfferPdfStylePrefs = Pick<OfferPdfDocumentPrefs, 'format' | 'templateCode' | 'palette' | 'settings'>;

/** Поле `pdf` слепка: стиль всегда, письмо и номер — у сделки и варианта (у избранного их нет) */
export type OfferPdfSnapshot = OfferPdfStylePrefs & Partial<Pick<OfferPdfDocumentPrefs, 'letter' | 'documentNumber'>>;

/**
 * Откуда настройки на экране. Выбор менеджера ложится только поверх умолчаний
 * и своего же прошлого; слепок сделки и правка на экране сильнее.
 */
export type OfferPdfPrefsOrigin = 'default' | 'manager' | 'snapshot' | 'user';

export interface OfferPdfState {
    prefs: OfferPdfDocumentPrefs;
    origin: OfferPdfPrefsOrigin;
}

export type OfferPdfPreviewPhase = 'idle' | 'loading' | 'ready' | 'failed';

/** Превью документа на экране КП */
export interface OfferPdfPreviewState {
    phase: OfferPdfPreviewPhase;
    objectUrl: string | null;
    error: string | null;
    durationMs: number | null;
    /** Данные изменились после последнего собранного превью */
    stale: boolean;
}

export type OfferPdfGenerateStatus = 'idle' | 'generating' | 'done' | 'error';

/** Формирование файла: статус и ответ бэка */
export interface OfferPdfGenerateState {
    status: OfferPdfGenerateStatus;
    result: OfferPdfGenerateResponse | null;
    error: string | null;
}
