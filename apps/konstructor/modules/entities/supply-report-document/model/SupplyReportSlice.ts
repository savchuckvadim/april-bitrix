import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { SupplyFormItem } from './dto';
import type {
    SupplyContact,
    SupplyFormFile,
    SupplyFormStatus,
    SupplyGenerateResult,
} from './types';

export interface SupplyReportState {
    formStatus: SupplyFormStatus;
    formError: string | null;
    /** 15 полей формы отчёта с текущими значениями */
    items: SupplyFormItem[];
    /** Файлы по коду поля (current_contract / current_invoice) */
    files: Record<string, SupplyFormFile>;
    /** «Запустить процесс поставки» — после отчёта создать/обновить заявку RPA */
    needProcess: boolean;
    /** Открытая заявка RPA этой сделки; null — заявки нет, init-supply создаст */
    rpaId: number | null;
    contacts: SupplyContact[];
    generate: SupplyGenerateResult;
}

const initialGenerate: SupplyGenerateResult = {
    status: 'idle',
    error: null,
    link: null,
    rpaId: null,
};

const initialState: SupplyReportState = {
    formStatus: 'idle',
    formError: null,
    items: [],
    files: {},
    needProcess: true,
    rpaId: null,
    contacts: [],
    generate: initialGenerate,
};

export const supplyReportSlice = createSlice({
    name: 'supplyReport',
    initialState,
    reducers: {
        formLoading(state: SupplyReportState) {
            state.formStatus = 'loading';
            state.formError = null;
        },
        formLoaded(state: SupplyReportState, action: PayloadAction<SupplyFormItem[]>) {
            state.items = action.payload;
            state.formStatus = 'ready';
        },
        formFailed(state: SupplyReportState, action: PayloadAction<string>) {
            state.formStatus = 'error';
            state.formError = action.payload;
        },
        setValue(state: SupplyReportState, action: PayloadAction<{ code: string; value: SupplyFormItem['value'] }>) {
            const item = state.items.find(entry => entry.code === action.payload.code);
            if (item) item.value = action.payload.value;
        },
        setFile(state: SupplyReportState, action: PayloadAction<{ code: string; file: SupplyFormFile | null }>) {
            const { code, file } = action.payload;
            if (file) state.files[code] = file;
            else delete state.files[code];
            const item = state.items.find(entry => entry.code === code);
            // бэк по значению понимает, есть ли файл: имя — есть, null — снять
            if (item) item.value = file ? file.filename : null;
        },
        setNeedProcess(state: SupplyReportState, action: PayloadAction<boolean>) {
            state.needProcess = action.payload;
        },
        setRpaId(state: SupplyReportState, action: PayloadAction<number | null>) {
            state.rpaId = action.payload;
        },
        setContacts(state: SupplyReportState, action: PayloadAction<SupplyContact[]>) {
            state.contacts = action.payload;
        },
        generateStarted(state: SupplyReportState) {
            state.generate = { ...initialGenerate, status: 'generating' };
        },
        generateDone(state: SupplyReportState, action: PayloadAction<{ link: string; rpaId: number | null }>) {
            state.generate = { ...initialGenerate, status: 'done', ...action.payload };
            if (action.payload.rpaId) state.rpaId = action.payload.rpaId;
        },
        generateFailed(state: SupplyReportState, action: PayloadAction<string>) {
            state.generate = { ...initialGenerate, status: 'error', error: action.payload };
        },
        /** Новая сделка в плейсменте (setAppData-слушатель) — всё заново */
        reset() {
            return initialState;
        },
    },
});

export const supplyReportActions = supplyReportSlice.actions;
export const supplyReportReducer = supplyReportSlice.reducer;
