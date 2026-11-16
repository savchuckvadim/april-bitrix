import { normalizeOfferPdfLetter, normalizeOfferPdfStyle } from './offer-pdf-storage';
import type {
    OfferPdfDocumentPrefs,
    OfferPdfSnapshot,
    OfferPdfState,
    OfferPdfStylePrefs,
} from '../model/types';

/** Стиль без данных сделки */
export const offerPdfStyleOf = (prefs: OfferPdfDocumentPrefs): OfferPdfStylePrefs => ({
    format: prefs.format,
    templateCode: prefs.templateCode,
    palette: prefs.palette,
    settings: prefs.settings,
});

/**
 * В слепок сделки и варианта — всё, что на экране. Нетронутые умолчания не
 * пишем: такая сделка пойдёт за последним выбором менеджера.
 */
export const offerPdfForSnapshot = (offerPdf: OfferPdfState): OfferPdfSnapshot | null =>
    offerPdf.origin === 'default' ? null : offerPdf.prefs;

/** В избранное и акции — только стиль: письмо и номер принадлежат сделке */
export const offerPdfForLibrary = (offerPdf: OfferPdfState): OfferPdfSnapshot | null =>
    offerPdf.origin === 'default' ? null : offerPdfStyleOf(offerPdf.prefs);

/**
 * Слепок поверх экрана: стиль из слепка; письмо и номер — если слепок их
 * хранит, иначе остаются текущие (заготовка из избранного их не трогает).
 */
export const mergeOfferPdfSnapshot = (current: OfferPdfDocumentPrefs, raw: unknown): OfferPdfDocumentPrefs => {
    const value = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
    return {
        ...normalizeOfferPdfStyle(raw),
        letter: 'letter' in value ? normalizeOfferPdfLetter(value.letter) : current.letter,
        documentNumber:
            typeof value.documentNumber === 'string' ? value.documentNumber : current.documentNumber,
    };
};
