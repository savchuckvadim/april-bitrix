import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
    addressMap,
    RQ_TYPE,
    type AddressRqItem,
    type AddressTypeId,
    type BankRqItem,
    type RqBundle,
    type RqItem,
    type RqRecord,
} from './types';
import { getResolvedType } from '../lib/rq-util';
import { filterFieldItems } from '../lib/field-items-util';
import { getCurrentRq, getCurrentRqByType } from '../lib/current-rq-util';

export interface BXRQState {
    rqs: RqBundle | null;
    /** Реквизиты текущего типа клиента и выбранный среди них. */
    current: {
        items: RqRecord[];
        item: RqRecord | null;
    };
    /** Черновики редактирования (модалки): база / адрес / банк. */
    creating: {
        base: RqRecord | null;
        address: AddressRqItem | null;
        bank: BankRqItem | null;
        simpleBankComment: string;
    };
    settings: {
        isSimpleBankCommentMode: boolean;
    };
    errors: Record<string, string> | null;
    push: {
        reqired: string[];
        isUnderstanding: boolean;
    };
    isFetched: boolean;
    isLoading: boolean;
    isCreatingLoading: boolean;
    /** Коды полей, для которых сейчас считается падеж. */
    caseLoading: string[];
}

const initialState: BXRQState = {
    rqs: null,
    current: { items: [], item: null },
    creating: { base: null, address: null, bank: null, simpleBankComment: '' },
    settings: { isSimpleBankCommentMode: true },
    errors: null,
    push: { reqired: [], isUnderstanding: false },
    isFetched: false,
    isLoading: false,
    isCreatingLoading: false,
    caseLoading: [],
};

/** Записать значение в поле черновика (селекты и файлы — не текстовый ввод). */
const setFieldValue = (fields: RqItem[], code: string, value: string): RqItem[] =>
    fields.map(field =>
        field.code === code && field.type !== 'select' && field.type !== 'file'
            ? { ...field, value }
            : field,
    );

/** Текущий реквизит записать обратно в current.items и rqs[type].items. */
const syncCurrentItem = (state: BXRQState, clientType: RQ_TYPE) => {
    const item = state.current.item;
    if (!item) return;
    state.current.items = state.current.items.map(rq =>
        rq.bx_id === item.bx_id ? item : rq,
    );
    if (state.rqs) {
        state.rqs[getResolvedType(clientType)].items = state.current.items;
    }
};

export const bxrqSlice = createSlice({
    name: 'bxrq',
    initialState,
    reducers: {
        setLoading(state: BXRQState, action: PayloadAction<boolean>) {
            state.isLoading = action.payload;
        },
        setFetched(
            state: BXRQState,
            action: PayloadAction<{ bxrq: RqBundle; currentRqId?: number }>,
        ) {
            const { bxrq, currentRqId } = action.payload;
            const current = currentRqId ? getCurrentRq(bxrq, currentRqId) : null;
            state.rqs = { ...bxrq, current: current ?? bxrq.current };
            state.isFetched = true;
            state.isLoading = false;
            state.errors = null;
        },
        setFetchedStatus(state: BXRQState, action: PayloadAction<boolean>) {
            state.isFetched = action.payload;
            state.isLoading = false;
        },
        setCreatingLoadingStatus(state: BXRQState, action: PayloadAction<boolean>) {
            state.isCreatingLoading = action.payload;
        },
        /** Тип клиента известен → реквизиты этого типа (или пустой default). */
        setCurrentRqItems(
            state: BXRQState,
            action: PayloadAction<{ clientType: RQ_TYPE; currentRqId?: number }>,
        ) {
            if (!state.rqs) return;
            const rqData = state.rqs[getResolvedType(action.payload.clientType)];
            if (!rqData) return;

            const isDefault =
                !rqData.items.length || rqData.items[0]?.bx_id === -1;
            const items = isDefault ? [rqData.default] : rqData.items;
            const wanted = action.payload.currentRqId
                ? getCurrentRqByType(items, action.payload.currentRqId)
                : null;

            state.current.items = items;
            state.current.item = wanted ?? items[0] ?? rqData.default;
        },
        setCurrentItem(state: BXRQState, action: PayloadAction<{ item: RqRecord }>) {
            const exists = state.current.items.some(
                item => item.bx_id === action.payload.item.bx_id,
            );
            state.current.item = exists ? { ...action.payload.item } : state.current.item;
        },

        initBaseCreating(
            state: BXRQState,
            action: PayloadAction<{ currentClientType: RQ_TYPE }>,
        ) {
            if (!state.current.item) return;
            const base = { ...state.current.item };
            base.fields = filterFieldItems(base.fields, action.payload.currentClientType);
            state.creating.base = base;
        },
        /** Реквизит сохранён на бэке: подставить bx_id/поля и закрыть черновик. */
        saveBaseCreating(
            state: BXRQState,
            action: PayloadAction<{
                item: RqRecord;
                clientType: RQ_TYPE;
            }>,
        ) {
            const { item, clientType } = action.payload;
            state.current.item = item;
            // новый реквизит (-1) становится созданным
            state.current.items = state.current.items.map(rq =>
                rq.bx_id === -1 || rq.bx_id === item.bx_id ? item : rq,
            );
            if (state.rqs) {
                state.rqs[getResolvedType(clientType)].items = state.current.items;
            }
            state.creating.base = null;
            state.creating.simpleBankComment = '';
        },
        cancelBaseCreating(state: BXRQState) {
            state.creating.base = null;
            state.creating.simpleBankComment = '';
        },
        setSimpleBankCommentMode(
            state: BXRQState,
            action: PayloadAction<{ enabled: boolean }>,
        ) {
            state.settings.isSimpleBankCommentMode = action.payload.enabled;
        },
        setSimpleBankComment(state: BXRQState, action: PayloadAction<{ value: string }>) {
            state.creating.simpleBankComment = action.payload.value;
        },

        initAddressCreating(
            state: BXRQState,
            action: PayloadAction<{ typeId: AddressTypeId }>,
        ) {
            const found = state.current.item?.address.items.find(
                address => address.type_id === action.payload.typeId,
            );
            if (found) state.creating.address = { ...found };
        },
        /** Черновик адреса типа typeId из другого адреса реквизита. */
        initCopyAddressCreating(
            state: BXRQState,
            action: PayloadAction<{ typeId: AddressTypeId }>,
        ) {
            const source = state.current.item?.address.items.find(
                address => address.type_id !== action.payload.typeId,
            );
            if (source) {
                state.creating.address = {
                    ...source,
                    type_id: action.payload.typeId,
                    name_type: addressMap[action.payload.typeId].name_type,
                };
            }
        },
        saveAddressCreating(
            state: BXRQState,
            action: PayloadAction<{ typeId: AddressTypeId; clientType: RQ_TYPE }>,
        ) {
            const draft = state.creating.address;
            if (!state.current.item || !draft) return;
            state.current.item.address.items = state.current.item.address.items.map(
                address => (address.type_id === action.payload.typeId ? draft : address),
            );
            syncCurrentItem(state, action.payload.clientType);
            state.creating.address = null;
        },
        cancelAddressCreating(state: BXRQState) {
            state.creating.address = null;
        },

        initBankCreating(state: BXRQState) {
            const bank = state.current.item?.bank;
            const current = bank?.items[0] ?? bank?.current;
            if (current) state.creating.bank = { ...current };
        },
        saveBankCreating(
            state: BXRQState,
            action: PayloadAction<{ bankId: number; clientType: RQ_TYPE }>,
        ) {
            if (!state.creating.bank || !state.current.item) return;
            const updatedBank: BankRqItem = {
                ...state.creating.bank,
                id: action.payload.bankId,
            };
            state.current.item.bank = {
                items: [updatedBank],
                current: updatedBank,
                fields: updatedBank.fields,
            };
            syncCurrentItem(state, action.payload.clientType);
            state.creating.bank = null;
        },
        cancelBankCreating(state: BXRQState) {
            state.creating.bank = null;
        },

        setBaseProp(state: BXRQState, action: PayloadAction<{ code: string; value: string }>) {
            if (state.creating.base) {
                state.creating.base.fields = setFieldValue(
                    state.creating.base.fields,
                    action.payload.code,
                    action.payload.value,
                );
            }
        },
        setAddressProp(
            state: BXRQState,
            action: PayloadAction<{ code: string; value: string }>,
        ) {
            if (state.creating.address) {
                state.creating.address.fields = setFieldValue(
                    state.creating.address.fields,
                    action.payload.code,
                    action.payload.value,
                );
            }
        },
        setBankProp(state: BXRQState, action: PayloadAction<{ code: string; value: string }>) {
            if (state.creating.bank) {
                state.creating.bank.fields = setFieldValue(
                    state.creating.bank.fields,
                    action.payload.code,
                    action.payload.value,
                );
            }
        },
        /** Переключить признак «поле в расчёте падежа». */
        setCaseLoading(state: BXRQState, action: PayloadAction<{ code: string }>) {
            const { code } = action.payload;
            state.caseLoading = state.caseLoading.includes(code)
                ? state.caseLoading.filter(item => item !== code)
                : [...state.caseLoading, code];
        },

        setError(state: BXRQState, action: PayloadAction<{ code: string; value: string }>) {
            state.errors = { ...(state.errors ?? {}), [action.payload.code]: action.payload.value };
        },
        cleanError(state: BXRQState, action: PayloadAction<{ code: string }>) {
            if (!state.errors) return;
            const { [action.payload.code]: _removed, ...rest } = state.errors;
            state.errors = Object.keys(rest).length > 0 ? rest : null;
        },
        cleanErrors(state: BXRQState) {
            state.errors = null;
        },
        setRequiredUnderstand(state: BXRQState, action: PayloadAction<{ status: boolean }>) {
            state.push.isUnderstanding = action.payload.status;
        },
        setRequired(state: BXRQState, action: PayloadAction<{ required: string[] }>) {
            state.push.reqired = action.payload.required;
        },
    },
});

export const bxrqActions = bxrqSlice.actions;
export const bxrqReducer = bxrqSlice.reducer;
