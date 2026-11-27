import type {
    ComplectCompositionDto,
    OfferPdfGenerateDto,
    OfferPdfGenerateResponseDto,
    OfferPdfPaletteItemDto,
    OfferPdfTemplateCode as OfferPdfTemplateCodeDto,
    OfferPdfTemplateItemDto,
} from '@workspace/nest-konstructor-api';
import type { DocComplectsFields, DocVariant, OfferInvoice } from '../../document-payload/model/dto';
import type { OfferSalesFlowFields } from '../../offer-document/model/types';

/**
 * Доменные имена generated-DTO offer-pdf: UI и хуки берут типы отсюда —
 * переименование на бэке правится только в этом файле и в lib/api.
 */

/** Код встроенного PDF-стиля — как его знает бэк */
export type OfferPdfTemplateCode = OfferPdfTemplateCodeDto;

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

/**
 * Как печатать наполнение общего набора с несколькими комплектами:
 * объединённым списком без повторов или разделами по комплектам.
 */
export const OFFER_COMPLECTS_MODE = {
    MERGED: 'merged',
    SEPARATE: 'separate',
} as const;
export type OfferComplectsMode = (typeof OFFER_COMPLECTS_MODE)[keyof typeof OFFER_COMPLECTS_MODE];

export const OFFER_COMPLECTS_MODE_OPTIONS: Array<{ value: OfferComplectsMode; label: string }> = [
    { value: OFFER_COMPLECTS_MODE.MERGED, label: 'Объединённо' },
    { value: OFFER_COMPLECTS_MODE.SEPARATE, label: 'По комплектам' },
];

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
    /**
     * Сопроводительное письмо в КП. Выключено: КП без письма, печать и подпись
     * поставщика под ним тоже не печатаются. Уходит и в PDF-запрос (поле
     * `settings.withLetter`), и в Word-запрос (поле верхнего уровня
     * `withLetter`); записи без поля читаются как «с письмом».
     */
    withLetter: boolean;
    withStamps: boolean;
    withManager: boolean;
    isPriceFirst: boolean;
    salePhrase: string;
    /** Титульный лист — у стилей, где он есть */
    withCover: boolean;
    /** Страница о системе или о сервисе — у стилей, где она есть */
    withPromo: boolean;
    /**
     * Способ печати наполнения комплектов. Уходит в запрос полем верхнего
     * уровня `complectsMode` (в `settings` бэка его нет); записи без поля
     * читаются как объединённое наполнение.
     */
    complectsMode: OfferComplectsMode;
    /**
     * Печатать наполнение каждого набора для сравнения. Выключено: у наборов
     * для сравнения печатаются только цены, наполнение одно, общего набора.
     * Включено: после наполнения общего набора идёт блок «Наполнение наборов
     * для сравнения». Уходит в запрос полем верхнего уровня
     * `alternativeComplects` с данными наборов (в `settings` бэка его нет);
     * записи без поля читаются как выключенное.
     */
    alternativeComplects: boolean;
}

export const OFFER_PDF_DEFAULT_SETTINGS: OfferPdfSettings = {
    descriptionMode: OFFER_PDF_DESCRIPTION_MODE.SMALL,
    viewMode: OFFER_PDF_VIEW_MODE.LIST,
    withLetter: true,
    withStamps: true,
    withManager: true,
    isPriceFirst: false,
    salePhrase: '',
    withCover: true,
    withPromo: true,
    complectsMode: OFFER_COMPLECTS_MODE.MERGED,
    alternativeComplects: false,
};

/** Письмо: пустые поля — шаблон подставит свои. */
export interface OfferPdfLetter {
    appeal: string;
    text: string;
}

export const OFFER_PDF_EMPTY_LETTER: OfferPdfLetter = { appeal: '', text: '' };

/** Гамма стиля: та же вёрстка в другом цвете; `swatch` — цвет кружка в выборе */
export type OfferPdfPaletteInfo = OfferPdfPaletteItemDto;

/**
 * Встроенный PDF-стиль (GET /offer-pdf/templates): есть ли титульник и
 * промо-страница, гаммы (первая — по умолчанию; пусто — гамма одна).
 */
export type OfferPdfTemplateInfo = OfferPdfTemplateItemDto;

export const OFFER_PDF_DEFAULT_TEMPLATE_CODE = 'classic';

/** Файл КП на экране: ссылка и отображаемое имя. */
export interface OfferPdfFileLink {
    link: string;
    name: string;
}

/**
 * Файл КП в ответе генерации (поле links): ссылка на сервере, ссылка на Диске
 * Битрикса (null — файл на Диск не попал) и имя документа.
 */
export interface OfferPdfResponseFile {
    link: string;
    name: string;
    bitrixLink?: string | null;
    fileName?: string;
    size?: number;
}

/**
 * Ответ POST /offer-pdf/generate: ссылки на файл, прикреплён ли он к сделке и
 * `missingAssets` — каких картинок и логотипов стиля не нашлось на сервере.
 *
 * `links` (все файлы КП), `invoiceLinks` (файлы счетов) и `warnings` (в том
 * числе «Счёт не сформирован: …») сгенерированный клиент описывает с 24.11, где
 * `invoiceLinks` обязателен. Здесь все три поля необязательны, а файл — в
 * мягкой форме `OfferPdfResponseFile`: ответ прежнего бэка (до выкладки или во
 * время неё) их не содержит, и экран читает его так же.
 */
export type OfferPdfGenerateResponse = Omit<
    OfferPdfGenerateResponseDto,
    'links' | 'invoiceLinks' | 'warnings'
> & {
    links?: OfferPdfResponseFile[];
    invoiceLinks?: OfferPdfResponseFile[];
    warnings?: string[];
};

/**
 * Поля Word-запроса, которых у PDF-запроса превью нет. Список общий для превью
 * и ключа превью: правка счёта не должна пересобирать превью, поэтому `invoice`
 * и `invoiceTemplateId` в них не входят. В запрос формирования они добавляются
 * отдельно (withOfferPdfInvoice).
 */
export const OFFER_PDF_OMITTED_WORD_FIELDS = [
    'templateId',
    'invoiceTemplateId',
    'invoice',
    'isWord',
    'withoutQueue',
    'onlyBitrixSave',
    // у PDF-запроса флаг письма лежит в settings.withLetter
    'withLetter',
] as const;
export type OfferPdfOmittedWordField = (typeof OFFER_PDF_OMITTED_WORD_FIELDS)[number];

/**
 * Настройки документа в PDF-запросе. Поле `withLetter` бэк принимает, в
 * сгенерированном клиенте его пока нет. После `pnpm run generate` оно появится
 * в OfferPdfSettingsDto, и расширение можно убрать.
 */
export type OfferPdfRequestSettings = NonNullable<OfferPdfGenerateDto['settings']> & { withLetter?: boolean };

/**
 * Запрос КП в PDF: данные те же, что для Word-шаблона (бэк считает их
 * одним кодом), плюс код стиля, гамма, настройки, письмо и номер. Варианты
 * комплекта и настройки сделки идут необязательными полями `variants` и
 * `composition` той же формы, что у generate-multi; участников нет — полей нет.
 *
 * Бэк принимает `variants` и `composition` у превью и генерации PDF, а также
 * `complects`, `complectsMode` (наполнение по комплектам) и `alternativeComplects`
 * (наполнение наборов для сравнения) на верхнем уровне и в каждом участнике;
 * в сгенерированном клиенте этих полей пока нет. После
 * `pnpm run generate` они появятся в OfferPdfGenerateDto и DocumentVariantDto,
 * и расширение ниже можно убрать.
 *
 * Запрос формирования принимает ещё необязательные `invoice` (та же форма, что у
 * Word) и `invoiceTemplateId` (пустая строка: шаблон счёта бэк подбирает сам), а
 * также поля потока продаж `salesFlow` и `presentation` (withOfferPdfSalesFlow).
 * Запрос превью их не несёт.
 */
export type OfferPdfGenerateRequest = Omit<OfferPdfGenerateDto, 'settings'> &
    DocComplectsFields &
    OfferSalesFlowFields & {
        settings?: OfferPdfRequestSettings;
        variants?: OfferPdfVariant[];
        composition?: ComplectCompositionDto;
        complectsMode?: OfferComplectsMode;
        invoice?: OfferInvoice;
        invoiceTemplateId?: string;
    };

/** Участник PDF-КП: форма участника Word-КП плюс способ печати его наполнения. */
export type OfferPdfVariant = DocVariant & { complectsMode?: OfferComplectsMode };

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
