import { getLocalStorageJson, setLocalStorageJson } from '@workspace/api';
import {
    OFFER_COMPLECTS_MODE,
    OFFER_DOCUMENT_FORMAT,
    OFFER_PDF_DEFAULT_SETTINGS,
    OFFER_PDF_DEFAULT_TEMPLATE_CODE,
    OFFER_PDF_DESCRIPTION_MODE,
    OFFER_PDF_EMPTY_LETTER,
    OFFER_PDF_VIEW_MODE,
    type OfferComplectsMode,
    type OfferDocumentFormat,
    type OfferPdfDescriptionMode,
    type OfferPdfDocumentPrefs,
    type OfferPdfLetter,
    type OfferPdfStylePrefs,
    type OfferPdfViewMode,
} from '../model/types';

/** Копия последнего выбора менеджера в браузере — до ответа сервера */
export const OFFER_PDF_PREFS_STORAGE_KEY = 'offerPdfDocumentPrefs';

export const OFFER_PDF_DEFAULT_PREFS: OfferPdfDocumentPrefs = {
    format: OFFER_DOCUMENT_FORMAT.WORD,
    templateCode: OFFER_PDF_DEFAULT_TEMPLATE_CODE,
    palette: null,
    settings: OFFER_PDF_DEFAULT_SETTINGS,
    letter: OFFER_PDF_EMPTY_LETTER,
    documentNumber: '',
};

const FORMATS = new Set<string>(Object.values(OFFER_DOCUMENT_FORMAT));
const DESCRIPTION_MODES = new Set<string>(Object.values(OFFER_PDF_DESCRIPTION_MODE));
const VIEW_MODES = new Set<string>(Object.values(OFFER_PDF_VIEW_MODE));
const COMPLECTS_MODES = new Set<string>(Object.values(OFFER_COMPLECTS_MODE));

const pickString = (value: unknown, fallback: string): string =>
    typeof value === 'string' ? value : fallback;
const pickBoolean = (value: unknown, fallback: boolean): boolean =>
    typeof value === 'boolean' ? value : fallback;
const pickNullableString = (value: unknown): string | null =>
    typeof value === 'string' && value.length > 0 ? value : null;
const pickEnum = <T extends string>(value: unknown, allowed: Set<string>, fallback: T): T =>
    typeof value === 'string' && allowed.has(value) ? (value as T) : fallback;

const asRecord = (value: unknown): Record<string, unknown> =>
    value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

/**
 * Стиль из хранилища, слепка или app_cache приводим к допустимым значениям:
 * мусор и записи старого вида не должны ломать экран.
 */
export const normalizeOfferPdfStyle = (raw: unknown): OfferPdfStylePrefs => {
    const value = asRecord(raw);
    const settings = asRecord(value.settings);
    const defaults = OFFER_PDF_DEFAULT_SETTINGS;
    return {
        format: pickEnum<OfferDocumentFormat>(value.format, FORMATS, OFFER_PDF_DEFAULT_PREFS.format),
        templateCode: pickString(value.templateCode, OFFER_PDF_DEFAULT_TEMPLATE_CODE),
        palette: pickNullableString(value.palette),
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
            withCover: pickBoolean(settings.withCover, defaults.withCover),
            withPromo: pickBoolean(settings.withPromo, defaults.withPromo),
            // слепки и записи кэша до наполнения по комплектам поля не имеют: там объединённое
            complectsMode: pickEnum<OfferComplectsMode>(
                settings.complectsMode,
                COMPLECTS_MODES,
                defaults.complectsMode,
            ),
            // записи до наполнения наборов для сравнения поля не имеют: там выключено
            alternativeComplects: pickBoolean(settings.alternativeComplects, defaults.alternativeComplects),
        },
    };
};

export const normalizeOfferPdfLetter = (raw: unknown): OfferPdfLetter => {
    const letter = asRecord(raw);
    return { appeal: pickString(letter.appeal, ''), text: pickString(letter.text, '') };
};

/** Полные настройки экрана: стиль, письмо и номер */
export const normalizeOfferPdfPrefs = (raw: unknown): OfferPdfDocumentPrefs => {
    const value = asRecord(raw);
    return {
        ...normalizeOfferPdfStyle(raw),
        letter: normalizeOfferPdfLetter(value.letter),
        documentNumber: pickString(value.documentNumber, ''),
    };
};

/** null — в этом браузере менеджер ещё ничего не выбирал */
export const loadOfferPdfStyle = (): OfferPdfStylePrefs | null => {
    const raw = getLocalStorageJson<unknown>(OFFER_PDF_PREFS_STORAGE_KEY);
    return raw ? normalizeOfferPdfStyle(raw) : null;
};

export const saveOfferPdfStyle = (style: OfferPdfStylePrefs): void => {
    setLocalStorageJson(OFFER_PDF_PREFS_STORAGE_KEY, style);
};

/** Свёрнута ли карточка стиля и настроек на экране КП — удобство этого браузера */
const SETTINGS_OPEN_STORAGE_KEY = 'offerPdfSettingsOpen';

/** null — менеджер ещё не сворачивал карточку */
export const loadOfferPdfSettingsOpen = (): boolean | null => {
    const raw = getLocalStorageJson<unknown>(SETTINGS_OPEN_STORAGE_KEY);
    return typeof raw === 'boolean' ? raw : null;
};

export const saveOfferPdfSettingsOpen = (open: boolean): void => {
    setLocalStorageJson(SETTINGS_OPEN_STORAGE_KEY, open);
};
