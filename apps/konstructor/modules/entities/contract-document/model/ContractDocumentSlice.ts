import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ContractFormField, ContractSpecificationItem } from './dto';
import type {
    ContractDealFieldValues,
    ContractFormStatus,
    ContractGenerateResult,
} from './types';

export interface ContractDocumentState {
    /** Форма с бэка (общая часть + спецификация) */
    formStatus: ContractFormStatus;
    formError: string | null;
    contractForm: ContractFormField[];
    /** Спецификация — менеджер правит значения строк */
    specification: ContractSpecificationItem[];
    /** Поля сделки Bitrix по pbx-коду; дефолты из сделки подставлены один раз */
    dealFields: ContractDealFieldValues;
    dealFieldsInitialized: boolean;
    /** Поле, которое сейчас пишется в Bitrix */
    savingField: string | null;
    saveError: string | null;
    /** Номер договора: поля в pbx-каноне нет — живёт на экране и уходит в payload */
    contractNumber: string;
    generate: ContractGenerateResult;
}

const initialGenerate: ContractGenerateResult = {
    status: 'idle',
    error: null,
    link: null,
    documentName: null,
};

const initialState: ContractDocumentState = {
    formStatus: 'idle',
    formError: null,
    contractForm: [],
    specification: [],
    dealFields: {},
    dealFieldsInitialized: false,
    savingField: null,
    saveError: null,
    contractNumber: '',
    generate: initialGenerate,
};

export const contractDocumentSlice = createSlice({
    name: 'contractDocument',
    initialState,
    reducers: {
        formLoading(state: ContractDocumentState) {
            state.formStatus = 'loading';
            state.formError = null;
        },
        formLoaded(
            state: ContractDocumentState,
            action: PayloadAction<{ contractForm: ContractFormField[]; specification: ContractSpecificationItem[] }>,
        ) {
            state.contractForm = action.payload.contractForm;
            state.specification = action.payload.specification;
            state.formStatus = 'ready';
        },
        formFailed(state: ContractDocumentState, action: PayloadAction<string>) {
            state.formStatus = 'error';
            state.formError = action.payload;
        },
        setSpecificationValue(state: ContractDocumentState, action: PayloadAction<{ code: string; value: string }>) {
            const item = state.specification.find(entry => entry.code === action.payload.code);
            if (item) item.value = action.payload.value;
        },
        setDealFieldsDefaults(state: ContractDocumentState, action: PayloadAction<ContractDealFieldValues>) {
            state.dealFields = action.payload;
            state.dealFieldsInitialized = true;
        },
        setDealField(state: ContractDocumentState, action: PayloadAction<{ code: string; value: string }>) {
            state.dealFields[action.payload.code] = action.payload.value;
        },
        savingField(state: ContractDocumentState, action: PayloadAction<string | null>) {
            state.savingField = action.payload;
            if (action.payload) state.saveError = null;
        },
        saveFailed(state: ContractDocumentState, action: PayloadAction<string>) {
            state.savingField = null;
            state.saveError = action.payload;
        },
        setContractNumber(state: ContractDocumentState, action: PayloadAction<string>) {
            state.contractNumber = action.payload;
        },
        generateStarted(state: ContractDocumentState) {
            state.generate = { ...initialGenerate, status: 'generating' };
        },
        generateDone(state: ContractDocumentState, action: PayloadAction<{ link: string; documentName: string }>) {
            state.generate = { ...initialGenerate, status: 'done', ...action.payload };
        },
        generateFailed(state: ContractDocumentState, action: PayloadAction<string>) {
            state.generate = { ...initialGenerate, status: 'error', error: action.payload };
        },
        /** Новая сделка в плейсменте (setAppData-слушатель) — всё заново */
        reset() {
            return initialState;
        },
    },
});

export const contractDocumentActions = contractDocumentSlice.actions;
export const contractDocumentReducer = contractDocumentSlice.reducer;
