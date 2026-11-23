import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ContractFormField, ContractSpecificationItem } from './dto';
import {
    initialContractGenerate,
    initialContractUnitState,
    type ContractDealFieldValues,
    type ContractFormStatus,
    type ContractGenerateResult,
    type ContractUnitState,
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
    /**
     * Договорные единицы (договор на каждый вариант комплекта, когда варианты
     * продаются вместе) по ключу единицы. Пусто, пока единиц нет: тогда экран
     * работает по полям выше.
     */
    units: Record<string, ContractUnitState>;
}

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
    generate: initialContractGenerate(),
    units: {},
};

/** Состояние единицы; первое обращение заводит её с пустыми значениями. */
const unitOf = (state: ContractDocumentState, key: string): ContractUnitState => {
    const existing = state.units[key];
    if (existing) return existing;
    const created = initialContractUnitState();
    state.units[key] = created;
    return created;
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
        /**
         * Сборка изменилась: спецификация устарела (живая и всех единиц),
         * следующий вход запросит её заново
         */
        formStale(state: ContractDocumentState) {
            if (state.formStatus === 'ready') state.formStatus = 'idle';
            for (const unit of Object.values(state.units)) {
                if (unit.formStatus === 'ready') unit.formStatus = 'idle';
            }
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
            state.generate = { ...initialContractGenerate(), status: 'generating' };
        },
        generateDone(
            state: ContractDocumentState,
            action: PayloadAction<{ link: string; documentName: string; savedToDisk: boolean }>,
        ) {
            state.generate = { ...initialContractGenerate(), status: 'done', ...action.payload };
        },
        generateFailed(state: ContractDocumentState, action: PayloadAction<string>) {
            state.generate = { ...initialContractGenerate(), status: 'error', error: action.payload };
        },
        /**
         * Оставить состояние только у единиц, которые ещё есть среди участников
         * документов: вышедшие из сделки варианты не копят номера и спецификации.
         */
        unitsRetained(state: ContractDocumentState, action: PayloadAction<string[]>) {
            const keep = new Set(action.payload);
            for (const key of Object.keys(state.units)) {
                if (!keep.has(key)) delete state.units[key];
            }
        },
        unitFormLoading(state: ContractDocumentState, action: PayloadAction<{ key: string }>) {
            const unit = unitOf(state, action.payload.key);
            unit.formStatus = 'loading';
            unit.formError = null;
        },
        unitFormLoaded(
            state: ContractDocumentState,
            action: PayloadAction<{
                key: string;
                contractForm: ContractFormField[];
                specification: ContractSpecificationItem[];
            }>,
        ) {
            const unit = unitOf(state, action.payload.key);
            unit.contractForm = action.payload.contractForm;
            unit.specification = action.payload.specification;
            unit.formStatus = 'ready';
        },
        unitFormFailed(state: ContractDocumentState, action: PayloadAction<{ key: string; error: string }>) {
            const unit = unitOf(state, action.payload.key);
            unit.formStatus = 'error';
            unit.formError = action.payload.error;
        },
        unitSpecificationValue(
            state: ContractDocumentState,
            action: PayloadAction<{ key: string; code: string; value: string }>,
        ) {
            const item = state.units[action.payload.key]?.specification.find(
                entry => entry.code === action.payload.code,
            );
            if (item) item.value = action.payload.value;
        },
        unitContractNumber(state: ContractDocumentState, action: PayloadAction<{ key: string; value: string }>) {
            unitOf(state, action.payload.key).contractNumber = action.payload.value;
        },
        unitGenerateStarted(state: ContractDocumentState, action: PayloadAction<{ key: string }>) {
            unitOf(state, action.payload.key).generate = { ...initialContractGenerate(), status: 'generating' };
        },
        unitGenerateDone(
            state: ContractDocumentState,
            action: PayloadAction<{ key: string; link: string; documentName: string; savedToDisk: boolean }>,
        ) {
            const { key, ...result } = action.payload;
            unitOf(state, key).generate = { ...initialContractGenerate(), status: 'done', ...result };
        },
        unitGenerateFailed(state: ContractDocumentState, action: PayloadAction<{ key: string; error: string }>) {
            unitOf(state, action.payload.key).generate = {
                ...initialContractGenerate(),
                status: 'error',
                error: action.payload.error,
            };
        },
        /** Новая сделка в плейсменте (setAppData-слушатель) — всё заново, единицы тоже */
        reset() {
            return initialState;
        },
    },
});

export const contractDocumentActions = contractDocumentSlice.actions;
export const contractDocumentReducer = contractDocumentSlice.reducer;
