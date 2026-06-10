import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    EVSBXRQ,
    EvsRqItem,
    AddressRqItem,
    BankRqItem,
    ResolvedRQType,
} from '../type/evs-rq-type';
import { RQ_TYPE, StringInput } from '../type/input-type';
import { getResolvedType } from '../lib/rq-util';
import { filterFieldItems } from '../lib/field-items-util';
import { addressMap, AddressTypeId } from '../type/evs-address-type';
import { getCurrentRq, getCurrentRqByType } from '../lib/current-rq-util';

// Типы состояния
export type BXRQState = typeof initialState;

// Начальное состояние
const initialState = {
    rqs: null as null | EVSBXRQ,
    current: {
        items: [] as EvsRqItem[],
        item: null as EvsRqItem | null,
    },
    creating: {
        base: null as EvsRqItem | null,
        address: null as AddressRqItem | null,
        bank: null as BankRqItem | null,
        simpleBankComment: '',
    },
    settings: {
        isSimpleBankCommentMode: true,
    },
    errors: null as null | { [key: string]: string },
    push: {
        reqired: [] as string[],
        isUnderstanding: false,
    },
    isFetched: false,
    isLoading: false,
    isCreatingLoading: false,
    caseLoading: [] as string[],
};

// Создаем slice
export const bxrqSlice = createSlice({
    name: 'bxrq',
    initialState,
    reducers: {
        // Синхронные действия
        setLoading: (state: BXRQState, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setFetched: (
            state: BXRQState,
            action: PayloadAction<{
                bxrq: EVSBXRQ;
                currentRqId?: number | undefined;
            }>,
        ) => {
            const pay = action.payload;

            const current = pay.currentRqId
                ? getCurrentRq(pay.bxrq, pay.currentRqId)
                : pay.bxrq.current;
            const rqResult = {
                ...state.rqs,
                [RQ_TYPE.ORGANIZATION]:
                    pay.bxrq?.[RQ_TYPE.ORGANIZATION] || null,
                [RQ_TYPE.IP]: pay.bxrq[RQ_TYPE.IP] || null,
                [RQ_TYPE.FIZ]: pay.bxrq[RQ_TYPE.FIZ] || null,
                current: current || pay.bxrq.current,
            };

            state.rqs = rqResult;
            state.isFetched = true;
            state.isLoading = false;
            state.errors = null;
        },
        setFetchedStatus: (
            state: BXRQState,
            action: PayloadAction<boolean>,
        ) => {
            state.isFetched = action.payload;
            state.isLoading = false;
        },
        setCreatingLoadingStatus: (
            state: BXRQState,
            action: PayloadAction<boolean>,
        ) => {
            state.isCreatingLoading = action.payload;
        },
        setCurrentRqItems: (
            state: BXRQState,
            action: PayloadAction<{
                clientType: RQ_TYPE;
                currentRqId?: number;
            }>,
        ) => {
            if (!state.rqs) return;

            const resolvedType = getResolvedType(action.payload.clientType);
            const rqData = state.rqs[resolvedType];

            if (!rqData) return;

            const isDefault =
                !rqData.items ||
                !rqData.items.length ||
                rqData.items[0]?.bx_id === -1;
            const items: EvsRqItem[] = !isDefault
                ? rqData.items
                : [rqData.default];

            const current = action.payload.currentRqId
                ? getCurrentRqByType(items, action.payload.currentRqId)
                : undefined;

            const item: EvsRqItem = current
                ? current
                : items.length > 0
                    ? items[0]!
                    : rqData.default!;

            state.current.items = items;
            state.current.item = item;
        },
        saveCurrentRqItems: (
            state: BXRQState,
            action: PayloadAction<{ clientType: RQ_TYPE }>,
        ) => {
            if (state.rqs) {
                const resolvedType = getResolvedType(
                    action.payload.clientType,
                ) as ResolvedRQType;
                state.rqs[resolvedType].items = state.current.items;
            }
        },
        setCurrentItem: (
            state: BXRQState,
            action: PayloadAction<{ item: EvsRqItem }>,
        ) => {
            const searchingCurrent =
                state.current.items.find(
                    item => item.bx_id === action.payload.item.bx_id,
                ) || state.current.item;

            state.current.item = !searchingCurrent
                ? null
                : { ...action.payload.item };
        },
        initBaseCreating: (
            state: BXRQState,
            action: PayloadAction<{
                currentClientType: RQ_TYPE;
                // contractType: CONTRACT_LTYPE;
                // supplyType: SupplyTypesType;
            }>,
        ) => {

            if (state.current.item) {
                const base = { ...state.current.item };
                const baseFields = base.fields
                    ? filterFieldItems(
                        base.fields,
                        action.payload.currentClientType,
                        // action.payload.contractType,
                        // action.payload.supplyType,
                    )
                    : base.fields;

                base.fields = baseFields

                state.creating.base = base;
            }
        },
        saveBaseCreating: (
            state: BXRQState,
            action: PayloadAction<{ updatedState: Partial<BXRQState> }>,
        ) => {
            Object.assign(state, action.payload.updatedState);
        },
        cancelBaseCreating: (state: BXRQState) => {
            state.creating.base = null;
            state.creating.simpleBankComment = '';
        },
        setSimpleBankCommentMode: (
            state: BXRQState,
            action: PayloadAction<{ enabled: boolean }>,
        ) => {
            state.settings.isSimpleBankCommentMode = action.payload.enabled;
        },
        setSimpleBankComment: (
            state: BXRQState,
            action: PayloadAction<{ value: string }>,
        ) => {
            state.creating.simpleBankComment = action.payload.value;
        },
        initAddressCreating: (
            state: BXRQState,
            action: PayloadAction<{ typeId: AddressTypeId }>,
        ) => {
            if (!state.current.item) return;

            const searchingCreating = state.current.item.address.items.find(
                address => address.type_id === action.payload.typeId,
            );

            if (searchingCreating) {
                state.creating.address = { ...searchingCreating };
            }
        },
        initCopyAddressCreating: (
            state: BXRQState,
            action: PayloadAction<{ typeId: AddressTypeId }>,
        ) => {
            if (!state.current.item) return;

            const copySearchingCreating = state.current.item.address.items.find(
                address => address.type_id !== action.payload.typeId,
            );

            if (copySearchingCreating) {
                state.creating.address = {
                    ...copySearchingCreating,
                    type_id: action.payload.typeId,
                    name_type: addressMap[action.payload.typeId].name_type,
                };
            }
        },
        saveAddressCreating: (
            state: BXRQState,
            action: PayloadAction<{
                typeId: AddressTypeId;
                clientType: RQ_TYPE;
            }>,
        ) => {
            if (!state.current.item || !state.creating.address) {
                return;
            }

            // Обновляем адреса в текущем элементе
            state.current.item.address.items =
                state.current.item.address.items.map(ad => {
                    if (ad.type_id === action.payload.typeId) {
                        return state.creating.address!;
                    }
                    return ad;
                });

            // Обновляем элементы в current.items
            state.current.items = state.current.items.map((rq: EvsRqItem) => {
                if (rq.bx_id === state.current.item!.bx_id) {
                    return state.current.item!;
                }
                return rq;
            });

            // Обновляем rqs
            const resolvedType = getResolvedType(
                action.payload.clientType,
            ) as ResolvedRQType;
            if (state.rqs) {
                state.rqs[resolvedType].items = state.current.items;
            }

            // Очищаем creating.address
            state.creating.address = null;
        },
        cancelAddressCreating: (state: BXRQState) => {
            state.creating.address = null;
        },
        initBankCreating: (
            state: BXRQState,
            action: PayloadAction<{ bankId?: number }>,
        ) => {
            let currentBank = state.current.item?.bank.items[0];
            if (!currentBank) {
                currentBank = state.current.item?.bank.current;
            }
            if (currentBank) {
                state.creating.bank = { ...currentBank };
            }
        },
        saveBankCreating: (
            state: BXRQState,
            action: PayloadAction<{ bankId: number; clientType: RQ_TYPE }>,
        ) => {
            if (!state.creating.bank || !state.current.item) {
                return;
            }

            // Создаем обновленный банк
            const updatedBank: BankRqItem = {
                ...state.creating.bank,
                id: action.payload.bankId,
            };

            // Обновляем банк в текущем элементе
            state.current.item.bank = {
                ...state.current.item.bank,
                items: [updatedBank],
                current: updatedBank,
                fields: updatedBank.fields,
            };

            // Обновляем элементы в current.items
            state.current.items = state.current.items.map((rq: EvsRqItem) => {
                if (rq.bx_id === state.current.item!.bx_id) {
                    return state.current.item!;
                }
                return rq;
            });

            // Обновляем rqs
            const resolvedType = getResolvedType(
                action.payload.clientType,
            ) as ResolvedRQType;
            if (state.rqs) {
                state.rqs[resolvedType].items = state.current.items;
            }

            // Очищаем creating.bank
            state.creating.bank = null;
        },
        cancelBankCreating: (state: BXRQState) => {
            state.creating.bank = null;
        },
        setBaseProp: (
            state: BXRQState,
            action: PayloadAction<{ code: string; value: string }>,
        ) => {
            if (state.creating.base?.fields) {
                state.creating.base.fields = state.creating.base.fields.map(
                    f => {
                        if (
                            f.type !== 'select' &&
                            f.code === action.payload.code
                        ) {
                            return {
                                ...f,
                                value: action.payload.value,
                            } as StringInput;
                        }
                        return f;
                    },
                );
            }
        },
        setCaseLoading: (
            state: BXRQState,
            action: PayloadAction<{ code: string }>,
        ) => {
            if (!state.caseLoading.includes(action.payload.code)) {
                state.caseLoading.push(action.payload.code);
            } else {
                state.caseLoading = state.caseLoading.filter(
                    code => code !== action.payload.code,
                );
            }
        },
        setAddressProp: (
            state: BXRQState,
            action: PayloadAction<{ code: string; value: string }>,
        ) => {
            if (state.creating.address?.fields) {
                state.creating.address.fields =
                    state.creating.address.fields.map(f => {
                        if (f.code === action.payload.code) {
                            return {
                                ...f,
                                value: action.payload.value,
                            } as StringInput;
                        }
                        return f;
                    });
            }
        },
        setBankProp: (
            state: BXRQState,
            action: PayloadAction<{ code: string; value: string }>,
        ) => {
            if (state.creating.bank?.fields) {
                state.creating.bank.fields = state.creating.bank.fields.map(
                    f => {
                        if (
                            f.type !== 'select' &&
                            f.code === action.payload.code
                        ) {
                            return {
                                ...f,
                                value: action.payload.value,
                            } as StringInput;
                        }
                        return f;
                    },
                );
            }
        },
        setError: (
            state: BXRQState,
            action: PayloadAction<{ code: string; value: string }>,
        ) => {
            if (!state.errors) {
                state.errors = {};
            }
            state.errors[action.payload.code] = action.payload.value;
        },
        cleanError: (
            state: BXRQState,
            action: PayloadAction<{ code: string }>,
        ) => {
            if (state.errors) {
                const { [action.payload.code]: _, ...restErrors } =
                    state.errors;
                state.errors =
                    Object.keys(restErrors).length > 0 ? restErrors : null;
            }
        },
        cleanErrors: (state: BXRQState) => {
            state.errors = null;
        },
        setRequired: (
            state: BXRQState,
            action: PayloadAction<{ errors: string[] }>,
        ) => {
            state.push.reqired = action.payload.errors;
            state.push.isUnderstanding = action.payload.errors.length < 1;
        },
        setRequiredUnderstand: (
            state: BXRQState,
            action: PayloadAction<{ status: boolean }>,
        ) => {
            state.push.reqired = [];
            state.push.isUnderstanding = action.payload.status;
        },
    },
});

// Экспортируем действия
export const {
    setLoading,
    setFetched,
    setFetchedStatus,
    setCreatingLoadingStatus,
    setCurrentRqItems,
    saveCurrentRqItems,
    setCurrentItem,
    initBaseCreating,
    saveBaseCreating,
    cancelBaseCreating,
    setSimpleBankCommentMode,
    setSimpleBankComment,
    initAddressCreating,
    initCopyAddressCreating,
    saveAddressCreating,
    cancelAddressCreating,
    initBankCreating,
    saveBankCreating,
    cancelBankCreating,
    setBaseProp,
    setCaseLoading,
    setAddressProp,
    setBankProp,
    setError,
    cleanError,
    cleanErrors,
    setRequired,
    setRequiredUnderstand,
} = bxrqSlice.actions;

// Экспортируем редюсер
export const bxrqReducer = bxrqSlice.reducer;

// Селекторы
export const selectBXRQState = (state: { bxrq: BXRQState }) => state.bxrq;
export const selectBXRQData = (state: { bxrq: BXRQState }) => state.bxrq.rqs;
export const selectBXRQLoading = (state: { bxrq: BXRQState }) =>
    state.bxrq.isLoading;
export const selectBXRQError = (state: { bxrq: BXRQState }) =>
    state.bxrq.errors;
export const selectBXRQCurrentItem = (state: { bxrq: BXRQState }) =>
    state.bxrq.current.item;
export const selectBXRQCurrentItems = (state: { bxrq: BXRQState }) =>
    state.bxrq.current.items;
export const selectBXRQCreatingBase = (state: { bxrq: BXRQState }) =>
    state.bxrq.creating.base;
export const selectBXRQCreatingAddress = (state: { bxrq: BXRQState }) =>
    state.bxrq.creating.address;
export const selectBXRQCreatingBank = (state: { bxrq: BXRQState }) =>
    state.bxrq.creating.bank;
export const selectBXRQRequired = (state: { bxrq: BXRQState }) =>
    state.bxrq.push.reqired;
export const selectBXRQIsUnderstanding = (state: { bxrq: BXRQState }) =>
    state.bxrq.push.isUnderstanding;
