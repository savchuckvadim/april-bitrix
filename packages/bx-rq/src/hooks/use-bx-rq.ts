import { useSelector, useDispatch } from 'react-redux';
import {
    selectBXRQState,
    selectBXRQData,
    //   selectBXRQLoading,
    //   selectBXRQError,
    setLoading,
    setError,
    setCurrentItem,
    initBaseCreating,
    setSimpleBankComment,
    setSimpleBankCommentMode,
    setBankProp,
    setAddressProp,
    cancelBaseCreating,
    cancelAddressCreating,
    initAddressCreating,
    initCopyAddressCreating,
    cancelBankCreating,
    initBankCreating,
    //  clearError
} from '../model/bx-rq-slice';
import {
    fetchBXRQ,
    saveAddress,
    saveBank,
    saveBXRQ,
    setBasePropThunk,
} from '../model/bx-rq-thunk';
import { AppThunkDispatch } from '../model/bx-rq-thunk-types';
import { blurCase } from '../model/bx-rq-thunk';
import { BankRqItem, EvsRqItem } from '../type/evs-rq-type';
import { RQ_TYPE } from '../type/input-type';
import { AddressTypeId, BX_ADDRESS_TYPE } from '../type/evs-address-type';
import { AddressRqItem } from '../type/evs-rq-type';

import {
    getAddressFillPercent,
    getBankFillPercent,
    getRqFillPercent,
} from '../lib/rq-util';
import { getBankCommentValue } from '../lib/get-bank-comment-value-util';

// // Хук для получения всего состояния
export const useBXRQState = () => {
    return useSelector(selectBXRQState);
};

// // Хук для получения данных
export const useBXRQData = () => {
    return useSelector(selectBXRQData);
};

// // Хук для получения состояния загрузки
// export const useBXRQLoading = () => {
//     return useSelector(selectBXRQLoading);
// };

// // Хук для получения ошибки
// export const useBXRQError = () => {
//     return useSelector(selectBXRQError);
// };

// // Хук для действий
export const useBXRQActions = () => {
    const dispatch = useDispatch();

    return {
        setLoading: (loading: boolean) => dispatch(setLoading(loading)),
        // setData: (data: any[]) => dispatch(setData(data)),
        // setError: (error: string) => dispatch(setError(error)),
        // clearError: () => dispatch(clearError()),
    };
};

// // Комбинированный хук
export const useBXRQ = () => {
    const state = useBXRQState();

    const actions = useBXRQActions();

    return {
        ...state,
        ...actions,
    };
};

export const useBxRq = () => {
    const dispatch = useDispatch() as AppThunkDispatch;
    const state = useSelector(selectBXRQState);
    const actions = useBXRQActions();

    return {
        ...state,
        ...actions,
        fetchBXRQ: (domain: string, companyId: number, currentRqId?: number) =>
            dispatch(fetchBXRQ(domain, companyId, currentRqId)),
        initBaseCreating: (currentClientType: RQ_TYPE) =>
            dispatch(initBaseCreating({ currentClientType })),
        setCurrent: (item: EvsRqItem) => dispatch(setCurrentItem({ item })),
        saveBase: async (
            domain: string,
            companyId: number,
            currentClientType: RQ_TYPE,
        ) => {
            dispatch(saveBXRQ(domain, companyId, currentClientType));
        },
        // saveAddress: async (typeId: any, fields: any[]) => {
        //     console.log('saveAddress called with:', typeId, fields);
        //     // TODO: Реализовать сохранение адреса
        // },
        // saveBank: async (bankId: number, fields: any[]) => {
        //     console.log('saveBank called with:', bankId, fields);
        //     // TODO: Реализовать сохранение банковских реквизитов
        // },
        // copyAddress: async (fromTypeId: any, toTypeId: any) => {
        //     console.log('copyAddress called with:', fromTypeId, toTypeId);
        //     // TODO: Реализовать копирование адреса
        // },
        getRqFillPercent: (rq: EvsRqItem | null, clientType: RQ_TYPE) =>
            getRqFillPercent(rq, clientType),
    };
};

export const useBxRqEditBase = () => {
    const dispatch = useDispatch() as AppThunkDispatch;
    const state = useSelector(selectBXRQState);

    const creating = state.creating;
    const isCreatingLoading = state.isCreatingLoading;
    const caseLoading = state.caseLoading;
    // const actions = useBXRQActions();


    return {
        caseLoading,
        creating: creating.base,
        isCreatingLoading,
        saveError: state.errors?.save || null,
        simpleBankComment: state.creating.simpleBankComment,
        isSimpleBankCommentMode: state.settings?.isSimpleBankCommentMode ?? false,
        getBankCommentValue,
        initBaseCreating: (currentClientType: RQ_TYPE) =>
            dispatch(initBaseCreating({ currentClientType })),
        cancelBaseCreating: () => dispatch(cancelBaseCreating()),
        setSimpleBankCommentMode: (enabled: boolean) =>
            dispatch(setSimpleBankCommentMode({ enabled })),
        setSimpleBankComment: (value: string) =>
            dispatch(setSimpleBankComment({ value })),
        saveBase: async (
            domain: string,
            companyId: number,
            currentClientType: RQ_TYPE,
        ) => {
            dispatch(saveBXRQ(domain, companyId, currentClientType));
        },
        saveBXRQ: async (
            domain: string,
            companyId: number,
            currentClientType: RQ_TYPE,
        ) => {
            dispatch(saveBXRQ(domain, companyId, currentClientType));
        },
        saveAddress: async (
            domain: string,
            companyId: number,
            currentClientType: RQ_TYPE,
            typeId: any,
            fields: any[],
        ) => {
            dispatch(saveAddress(domain, companyId, currentClientType, typeId));
        },
        saveBank: async (bankId: number, fields: any[]) => {
            console.log('saveBank called with:', bankId, fields);
            // TODO: Реализовать сохранение банковских реквизитов
        },
        copyAddress: async (fromTypeId: any, toTypeId: any) => {
            console.log('copyAddress called with:', fromTypeId, toTypeId);
            // TODO: Реализовать копирование адреса
        },
        setBaseProp: (code: string, value: string) =>
            dispatch(setBasePropThunk(code, value)),
        blurCase: (code: string, value: string) =>
            dispatch(blurCase(code, value)),
        setAddressProp: (code: string, value: string) =>
            dispatch(setAddressProp({ code, value })),
        setBankProp: (code: string, value: string) =>
            dispatch(setBankProp({ code, value })),
        setError: (code: string, value: string) =>
            dispatch(setError({ code, value })),
    };
};

export interface IBxRqEditAddressHook {
    addresses: AddressRqItem[];
    percent: number;
    registredPercent: number;
    primaryPercent: number;
    creating: AddressRqItem | null;
    isCreatingLoading: boolean;
    initAddressCreating: (typeId: AddressTypeId) => void;
    cancelAddressCreating: () => void;
    saveAddress: (
        domain: string,
        companyId: number,
        currentClientType: RQ_TYPE,
        typeId: any,
        fields: any[],
    ) => void;
    initCopyAddressCreating: (typeId: AddressTypeId) => void;
    setAddressProp: (code: string, value: string) => void;
}
export const useBxRqEditAddress = (): IBxRqEditAddressHook => {
    const dispatch = useDispatch() as AppThunkDispatch;
    const state = useSelector(selectBXRQState);

    const creating = state.creating.address as AddressRqItem | null;
    const isCreatingLoading = state.isCreatingLoading;

    const addresses = state.current.item?.address.items || [];
    // const actions = useBXRQActions();
    const percent = getAddressFillPercent(addresses);
    const registredPercent = getAddressFillPercent(
        addresses.filter(item => item.type_id === BX_ADDRESS_TYPE.REGISTERED),
    );
    const primaryPercent = getAddressFillPercent(
        addresses.filter(item => item.type_id === BX_ADDRESS_TYPE.PRIMARY),
    );

    return {
        addresses,
        registredPercent,
        primaryPercent,
        percent,
        creating,
        isCreatingLoading,

        initAddressCreating: (typeId: AddressTypeId) =>
            dispatch(initAddressCreating({ typeId })),
        cancelAddressCreating: () => dispatch(cancelAddressCreating()),

        saveAddress: async (
            domain: string,
            companyId: number,
            currentClientType: RQ_TYPE,
            typeId: BX_ADDRESS_TYPE,
        ) => {
            dispatch(saveAddress(domain, companyId, currentClientType, typeId));
        },

        initCopyAddressCreating: (typeId: AddressTypeId) =>
            dispatch(initCopyAddressCreating({ typeId })),

        setAddressProp: (code: string, value: string) =>
            dispatch(setAddressProp({ code, value })),
        // blurCase: (code: string, value: string) => dispatch(blurCase(code, value)),
    };
};

export const useBxRqEditBank = () => {
    const dispatch = useDispatch() as AppThunkDispatch;
    const state = useSelector(selectBXRQState);

    const creating = state.creating.bank as BankRqItem | null;
    const isCreatingLoading = state.isCreatingLoading;

    const banks = state.current.item?.bank.items || [];
    const percent = getBankFillPercent(banks);

    return {
        creating,
        percent,
        isCreatingLoading,
        initBankCreating: () => dispatch(initBankCreating({})),

        cancelBankCreating: () => dispatch(cancelBankCreating()),
        saveBank: async (domain: string, companyId: number) => {
            dispatch(saveBank(domain, companyId));
        },

        setBankProp: (code: string, value: string) =>
            dispatch(setBankProp({ code, value })),
        setError: (code: string, value: string) =>
            dispatch(setError({ code, value })),
    };
};
