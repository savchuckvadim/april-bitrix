import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { bxrqActions } from '../../model/BxRqSlice';
import {
    blurCase,
    fetchBXRQ,
    saveAddress,
    saveBank,
    saveBXRQ,
} from '../../model/BxRqThunk';
import {
    BX_ADDRESS_TYPE,
    type AddressTypeId,
    type RQ_TYPE,
    type RqRecord,
} from '../../model/types';
import {
    getAddressFillPercent,
    getBankFillPercent,
    getRqFillPercent,
} from '../rq-util';
import { getBankCommentValue } from '../get-bank-comment-value-util';

/** Состояние реквизитов + загрузка/выбор/сохранение базовых полей. */
export const useBxRq = () => {
    const dispatch = useAppDispatch();
    const state = useAppSelector(s => s.bxrq);

    return {
        ...state,
        fetchBXRQ: (domain: string, companyId: number, currentRqId?: number) =>
            dispatch(fetchBXRQ(domain, companyId, currentRqId)),
        initBaseCreating: (currentClientType: RQ_TYPE) =>
            dispatch(bxrqActions.initBaseCreating({ currentClientType })),
        setCurrent: (item: RqRecord) => dispatch(bxrqActions.setCurrentItem({ item })),
        saveBase: (domain: string, companyId: number, currentClientType: RQ_TYPE) =>
            dispatch(saveBXRQ(domain, companyId, currentClientType)),
        getRqFillPercent,
    };
};

/** Редактирование базовых полей реквизита (модалка «Основная информация»). */
export const useBxRqEditBase = () => {
    const dispatch = useAppDispatch();
    const state = useAppSelector(s => s.bxrq);

    return {
        caseLoading: state.caseLoading,
        creating: state.creating.base,
        isCreatingLoading: state.isCreatingLoading,
        saveError: state.errors?.save ?? null,
        simpleBankComment: state.creating.simpleBankComment,
        isSimpleBankCommentMode: state.settings.isSimpleBankCommentMode,
        getBankCommentValue,
        initBaseCreating: (currentClientType: RQ_TYPE) =>
            dispatch(bxrqActions.initBaseCreating({ currentClientType })),
        cancelBaseCreating: () => dispatch(bxrqActions.cancelBaseCreating()),
        setSimpleBankCommentMode: (enabled: boolean) =>
            dispatch(bxrqActions.setSimpleBankCommentMode({ enabled })),
        setSimpleBankComment: (value: string) =>
            dispatch(bxrqActions.setSimpleBankComment({ value })),
        saveBase: (domain: string, companyId: number, currentClientType: RQ_TYPE) =>
            dispatch(saveBXRQ(domain, companyId, currentClientType)),
        setBaseProp: (code: string, value: string) =>
            dispatch(bxrqActions.setBaseProp({ code, value })),
        blurCase: (code: string, value: string) => dispatch(blurCase(code, value)),
        setError: (code: string, value: string) =>
            dispatch(bxrqActions.setError({ code, value })),
    };
};

/** Адреса реквизита: заполненность по типам, черновик, копирование. */
export const useBxRqEditAddress = () => {
    const dispatch = useAppDispatch();
    const state = useAppSelector(s => s.bxrq);

    const addresses = state.current.item?.address.items ?? [];
    const ofType = (typeId: BX_ADDRESS_TYPE) =>
        addresses.filter(item => item.type_id === typeId);

    return {
        addresses,
        percent: getAddressFillPercent(addresses),
        registredPercent: getAddressFillPercent(ofType(BX_ADDRESS_TYPE.REGISTERED)),
        primaryPercent: getAddressFillPercent(ofType(BX_ADDRESS_TYPE.PRIMARY)),
        creating: state.creating.address,
        isCreatingLoading: state.isCreatingLoading,
        initAddressCreating: (typeId: AddressTypeId) =>
            dispatch(bxrqActions.initAddressCreating({ typeId })),
        cancelAddressCreating: () => dispatch(bxrqActions.cancelAddressCreating()),
        saveAddress: (
            domain: string,
            companyId: number,
            currentClientType: RQ_TYPE,
            typeId: BX_ADDRESS_TYPE,
        ) => dispatch(saveAddress(domain, companyId, currentClientType, typeId)),
        initCopyAddressCreating: (typeId: AddressTypeId) =>
            dispatch(bxrqActions.initCopyAddressCreating({ typeId })),
        setAddressProp: (code: string, value: string) =>
            dispatch(bxrqActions.setAddressProp({ code, value })),
    };
};

/** Банковские реквизиты: заполненность, черновик, сохранение. */
export const useBxRqEditBank = () => {
    const dispatch = useAppDispatch();
    const state = useAppSelector(s => s.bxrq);

    return {
        creating: state.creating.bank,
        percent: getBankFillPercent(state.current.item?.bank.items ?? []),
        isCreatingLoading: state.isCreatingLoading,
        initBankCreating: () => dispatch(bxrqActions.initBankCreating()),
        cancelBankCreating: () => dispatch(bxrqActions.cancelBankCreating()),
        saveBank: (domain: string, companyId: number, currentClientType: RQ_TYPE) =>
            dispatch(saveBank(domain, companyId, currentClientType)),
        setBankProp: (code: string, value: string) =>
            dispatch(bxrqActions.setBankProp({ code, value })),
        setError: (code: string, value: string) =>
            dispatch(bxrqActions.setError({ code, value })),
    };
};
