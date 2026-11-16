import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { mergeOfferPdfSnapshot } from '../lib/offer-pdf-snapshot.util';
import { OFFER_PDF_DEFAULT_PREFS } from '../lib/offer-pdf-storage';
import {
    OFFER_PDF_EMPTY_LETTER,
    type OfferDocumentFormat,
    type OfferPdfDocumentPrefs,
    type OfferPdfLetter,
    type OfferPdfPrefsOrigin,
    type OfferPdfSettings,
    type OfferPdfSnapshot,
    type OfferPdfState,
    type OfferPdfStylePrefs,
} from './types';

const initialState: OfferPdfState = { prefs: OFFER_PDF_DEFAULT_PREFS, origin: 'default' };

/**
 * Настройки КП в PDF (и выбор формата) — в сторе: их пишет слепок сделки,
 * варианта и избранного, а последний выбор уходит менеджеру в app_cache.
 * Шаблоны, превью и результат генерации живут в контексте экрана.
 */
const offerPdfSlice = createSlice({
    name: 'offerPdf',
    initialState,
    reducers: {
        setFormat(state, action: PayloadAction<OfferDocumentFormat>) {
            state.prefs.format = action.payload;
            state.origin = 'user';
        },
        /** Новый стиль — его первая гамма */
        setTemplateCode(state, action: PayloadAction<string>) {
            state.prefs.templateCode = action.payload;
            state.prefs.palette = null;
            state.origin = 'user';
        },
        setPalette(state, action: PayloadAction<string>) {
            state.prefs.palette = action.payload;
            state.origin = 'user';
        },
        setSettings(state, action: PayloadAction<Partial<OfferPdfSettings>>) {
            state.prefs.settings = { ...state.prefs.settings, ...action.payload };
            state.origin = 'user';
        },
        setLetter(state, action: PayloadAction<Partial<OfferPdfLetter>>) {
            state.prefs.letter = { ...state.prefs.letter, ...action.payload };
            state.origin = 'user';
        },
        setDocumentNumber(state, action: PayloadAction<string>) {
            state.prefs.documentNumber = action.payload;
            state.origin = 'user';
        },
        /** Последний выбор менеджера: слепок сделки и правку на экране не перетирает */
        applyManager(state, action: PayloadAction<OfferPdfStylePrefs>) {
            if (state.origin === 'snapshot' || state.origin === 'user') return;
            state.prefs = { ...state.prefs, ...action.payload };
            state.origin = 'manager';
        },
        /** Слепок сделки, варианта или избранного — сильнее всего, что было на экране */
        applySnapshot(state, action: PayloadAction<OfferPdfSnapshot>) {
            state.prefs = mergeOfferPdfSnapshot(state.prefs, action.payload);
            state.origin = 'snapshot';
        },
        /** Новая сделка: письмо и номер остались от прошлой */
        resetDocument(state) {
            state.prefs.letter = OFFER_PDF_EMPTY_LETTER;
            state.prefs.documentNumber = '';
        },
    },
});

// Деструктуризация вместо экспорта slice.actions целиком — обход TS2742
const {
    setFormat,
    setTemplateCode,
    setPalette,
    setSettings,
    setLetter,
    setDocumentNumber,
    applyManager,
    applySnapshot,
    resetDocument,
} = offerPdfSlice.actions;
export const offerPdfActions = {
    setFormat,
    setTemplateCode,
    setPalette,
    setSettings,
    setLetter,
    setDocumentNumber,
    applyManager,
    applySnapshot,
    resetDocument,
};
export const offerPdfReducer = offerPdfSlice.reducer;

interface WithOfferPdf {
    offerPdf: OfferPdfState;
}

export const selectOfferPdfPrefs = (state: WithOfferPdf): OfferPdfDocumentPrefs => state.offerPdf.prefs;
export const selectOfferPdfOrigin = (state: WithOfferPdf): OfferPdfPrefsOrigin => state.offerPdf.origin;
