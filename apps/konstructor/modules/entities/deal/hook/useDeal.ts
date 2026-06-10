import { useSelector } from 'react-redux';
import { RootState } from '@/modules/app/model/store';

import { updateDealField, UpdateDealFieldPayload } from '../model/DealThunk';
// import { BxDealDataKeys } from '@alfa/entities';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';

export const useDeal = () => {
    const dispatch = useAppDispatch();
    const dealState = useSelector((state: RootState) => state.deal);
    const dealId = useAppSelector(state => state.app.bitrix.deal?.ID);
    const { fetched, loading } = useAppSelector(state => state.deal);
    // const getFieldByCode = (code: BxDealDataKeys) => {
    //     return dealState.dealData?.find(field => field.code === code);
    // };

    // const setDeal = (dealData: IDealFieldsData[]) => {
    //     dispatch(setDealData(dealData));
    // };

    // const setDealIdAction = (dealId: number) => {
    //     dispatch(setDealId(dealId));
    // };

    // const updateField = (fieldKey: BxDealDataKeys, value: string) => {
    //     dispatch(updateFieldValue({ fieldKey, value }));
    // };

    // const updateFieldWithAPI = async (
    //     fieldKey: BxDealDataKeys,
    //     value: string | number,
    // ) => {
    //     const field = getFieldByCode(fieldKey);


    return {
        //app state
        dealId,

        // State
        // dealData: dealState.,

        loading,
        fetched,
        error: dealState.error,
        isUpdating: dealState.isUpdating,

        //utils
        // getFieldByCode,
        // Actions
        // setDeal,
        // setDealId: setDealIdAction,
        // updateField,
        // updateFieldWithAPI,
        // clearDeal: clearDealAction,
        // setError: setErrorAction,
        // clearError: clearErrorAction,
    };
};
