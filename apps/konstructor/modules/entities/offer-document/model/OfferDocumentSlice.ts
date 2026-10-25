import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
    CASE_FIELD_OF,
    DEFAULT_INVOICE,
    EMPTY_RECIPIENT,
    type OfferGeneratedLink,
    type OfferGenerateResult,
    type OfferInvoiceAnswer,
    type OfferInvoiceForm,
    type OfferRecipientCaseField,
    type OfferRecipientField,
    type OfferRecipientForm,
} from './types';

export interface OfferDocumentState {
    /** Дефолты из сделки/компании подставлены (один раз на сделку) */
    initialized: boolean;
    recipient: OfferRecipientForm;
    /** Падеж запрошен у бэка и ещё не пришёл */
    caseLoading: OfferRecipientCaseField[];
    invoice: OfferInvoiceForm;
    generate: OfferGenerateResult;
}

const initialGenerate: OfferGenerateResult = {
    status: 'idle',
    error: null,
    operationId: null,
    links: [],
    warnings: [],
};

const initialState: OfferDocumentState = {
    initialized: false,
    recipient: EMPTY_RECIPIENT,
    caseLoading: [],
    invoice: DEFAULT_INVOICE,
    generate: initialGenerate,
};

export const offerDocumentSlice = createSlice({
    name: 'offerDocument',
    initialState,
    reducers: {
        setDefaults(
            state: OfferDocumentState,
            action: PayloadAction<{ recipient: OfferRecipientForm; invoice: Partial<OfferInvoiceForm> }>,
        ) {
            state.recipient = action.payload.recipient;
            state.invoice = { ...DEFAULT_INVOICE, ...action.payload.invoice };
            state.initialized = true;
            state.generate = initialGenerate;
        },
        setRecipientField(state: OfferDocumentState, action: PayloadAction<{ field: OfferRecipientField; value: string }>) {
            const { field, value } = action.payload;
            state.recipient[field] = value;
            // пустое имя/должность — пустой падеж, иначе в КП останется старое склонение
            if ((field === 'name' || field === 'position') && !value.trim()) {
                state.recipient[CASE_FIELD_OF[field]] = '';
            }
        },
        setRecipientCase(state: OfferDocumentState, action: PayloadAction<{ field: OfferRecipientCaseField; value: string }>) {
            state.recipient[CASE_FIELD_OF[action.payload.field]] = action.payload.value;
        },
        setCaseLoading(state: OfferDocumentState, action: PayloadAction<{ field: OfferRecipientCaseField; loading: boolean }>) {
            const { field, loading } = action.payload;
            state.caseLoading = loading
                ? Array.from(new Set([...state.caseLoading, field]))
                : state.caseLoading.filter(item => item !== field);
        },
        setInvoiceAnswer(state: OfferDocumentState, action: PayloadAction<{ answer: OfferInvoiceAnswer; value: boolean }>) {
            state.invoice[action.payload.answer] = action.payload.value;
        },
        setInvoiceDate(state: OfferDocumentState, action: PayloadAction<string>) {
            state.invoice.invoiceDate = action.payload;
        },
        setInvoiceNumber(state: OfferDocumentState, action: PayloadAction<string>) {
            state.invoice.invoiceNumber = action.payload;
        },
        generateStarted(state: OfferDocumentState) {
            state.generate = { ...initialGenerate, status: 'generating' };
        },
        generateDone(
            state: OfferDocumentState,
            action: PayloadAction<{
                operationId: string | null;
                links: OfferGeneratedLink[];
                warnings: string[];
            }>,
        ) {
            state.generate = { ...initialGenerate, status: 'done', ...action.payload };
        },
        generateFailed(state: OfferDocumentState, action: PayloadAction<string>) {
            state.generate = { ...initialGenerate, status: 'error', error: action.payload };
        },
        generateReset(state: OfferDocumentState) {
            state.generate = initialGenerate;
        },
        /** Новая сделка в плейсменте (setAppData-слушатель) — дефолты считаются заново */
        reset() {
            return initialState;
        },
    },
});

export const offerDocumentActions = offerDocumentSlice.actions;
export const offerDocumentReducer = offerDocumentSlice.reducer;
