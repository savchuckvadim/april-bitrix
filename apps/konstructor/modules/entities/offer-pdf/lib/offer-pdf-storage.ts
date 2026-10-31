import { getLocalStorageJson, setLocalStorageJson } from '@workspace/api';
import {
    OFFER_DOCUMENT_FORMAT,
    OFFER_PDF_DEFAULT_SETTINGS,
    OFFER_PDF_DEFAULT_TEMPLATE_CODE,
    OFFER_PDF_DESCRIPTION_MODE,
    OFFER_PDF_EMPTY_LETTER,
    OFFER_PDF_VIEW_MODE,
    type OfferDocumentFormat,
    type OfferPdfDescriptionMode,
    type OfferPdfDocumentPrefs,
    type OfferPdfViewMode,
} from '../model/types';

export const OFFER_PDF_PREFS_STORAGE_KEY = 'offerPdfDocumentPrefs';

export const OFFER_PDF_DEFAULT_PREFS: OfferPdfDocumentPrefs = {
    format: OFFER_DOCUMENT_FORMAT.WORD,
    templateCode: OFFER_PDF_DEFAULT_TEMPLATE_CODE,
    settings: OFFER_PDF_DEFAULT_SETTINGS,
    letter: OFFER_PDF_EMPTY_LETTER,
    documentNumber: '',
};

const FORMATS = new Set<string>(Object.values(OFFER_DOCUMENT_FORMAT));
const DESCRIPTION_MODES = new Set<string>(Object.values(OFFER_PDF_DESCRIPTION_MODE));
const VIEW_MODES = new Set<string>(Object.values(OFFER_PDF_VIEW_MODE));

const pickString = (value: unknown, fallback: string): string =>
    typeof value === 'string' ? value : fallback;
const pickBoolean = (value: unknown, fallback: boolean): boolean =>
    typeof value === 'boolean' ? value : fallback;
const pickEnum = <T extends string>(value: unknown, allowed: Set<string>, fallback: T): T =>
    typeof value === 'string' && allowed.has(value) ? (value as T) : fallback;

type RawPrefs = {
    format?: unknown;
    templateCode?: unknown;
    settings?: Record<string, unknown>;
    letter?: Record<string, unknown>;
    documentNumber?: unknown;
};

/** Сохранённые настройки приводим к допустимым значениям: мусор из хранилища не должен ломать экран. */
export const normalizeOfferPdfPrefs = (raw: unknown): OfferPdfDocumentPrefs => {
    if (!raw || typeof raw !== 'object') return OFFER_PDF_DEFAULT_PREFS;
    const value = raw as RawPrefs;
    const settings = value.settings ?? {};
    const letter = value.letter ?? {};
    const defaults = OFFER_PDF_DEFAULT_SETTINGS;
    return {
        format: pickEnum<OfferDocumentFormat>(value.format, FORMATS, OFFER_PDF_DEFAULT_PREFS.format),
        templateCode: pickString(value.templateCode, OFFER_PDF_DEFAULT_TEMPLATE_CODE),
        settings: {
            descriptionMode: pickEnum<OfferPdfDescriptionMode>(
                settings.descriptionMode,
                DESCRIPTION_MODES,
                defaults.descriptionMode,
            ),
            viewMode: pickEnum<OfferPdfViewMode>(settings.viewMode, VIEW_MODES, defaults.viewMode),
            withStamps: pickBoolean(settings.withStamps, defaults.withStamps),
            withManager: pickBoolean(settings.withManager, defaults.withManager),
            isPriceFirst: pickBoolean(settings.isPriceFirst, defaults.isPriceFirst),
            salePhrase: pickString(settings.salePhrase, defaults.salePhrase),
        },
        letter: {
            appeal: pickString(letter.appeal, ''),
            text: pickString(letter.text, ''),
        },
        documentNumber: pickString(value.documentNumber, ''),
    };
};

export const loadOfferPdfPrefs = (): OfferPdfDocumentPrefs =>
    normalizeOfferPdfPrefs(getLocalStorageJson<unknown>(OFFER_PDF_PREFS_STORAGE_KEY));

export const saveOfferPdfPrefs = (prefs: OfferPdfDocumentPrefs): void => {
    setLocalStorageJson(OFFER_PDF_PREFS_STORAGE_KEY, prefs);
};
