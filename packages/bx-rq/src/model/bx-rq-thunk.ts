// import { eventServiceAPI, EVS_ENDPOINT, RQStore } from '@workspace/api/';
import { API_METHOD } from '@workspace/api';
import {
    AddressRqItem,
    EvsResponse,
    EvsRqItem,
    ResolvedRQType,
} from '../type/evs-rq-type';
import { filterFieldItems, getFullName } from '../lib/field-items-util';

import { getResolvedType } from '../lib/rq-util';
import {
    cleanError,
    setError,
    setLoading,
    setFetched,
    setFetchedStatus,
    setCreatingLoadingStatus,
    saveBaseCreating,
    saveAddressCreating,
    saveBankCreating,
    setBaseProp as setBasePropAction,
    setAddressProp as setAddressPropAction,
    setBankProp as setBankPropAction,
    setRequiredUnderstand,
    BXRQState,
    setCaseLoading,
} from './bx-rq-slice';
import { AppThunkDispatch, AppThunkGetState } from './bx-rq-thunk-types';
import {
    BANK_RQ_ITEM_CODE,
    RQ_ITEM_CODE,
    RQ_TYPE,
    RqItem,
} from '../type/input-type';
import { BX_ADDRESS_TYPE } from '../type/evs-address-type';
import { BankRqItem, RQStore } from '../type/evs-rq-type';
import { eventServiceAPI, EVS_ENDPOINT } from '@workspace/api/src/services/april-service-event-api';

const updateBankFieldValue = (
    fields: RqItem[],
    code: string,
    value: string,
): RqItem[] => {
    return fields.map(field => {
        if (field.code === code && field.type !== 'select' && field.type !== 'file') {
            return {
                ...field,
                value,
            };
        }
        return field;
    });
};

const getSaveErrorMessage = (error: unknown): string => {
    const fallback = 'Ошибка сохранения реквизитов';
    if (!error) return fallback;

    const message =
        error instanceof Error
            ? error.message
            : typeof error === 'string'
              ? error
              : JSON.stringify(error);

    const normalized = message.toLowerCase();
    if (normalized.includes('инн') || normalized.includes('inn')) {
        if (
            normalized.includes('длин') ||
            normalized.includes('символ') ||
            normalized.includes('length')
        ) {
            return 'Ошибка сохранения ИНН: превышена допустимая длина';
        }
        return 'Ошибка сохранения ИНН';
    }

    return message || fallback;
};

const getApiErrorMessage = (result: unknown): string | null => {
    if (!result || typeof result !== 'object') {
        return null;
    }
    const response = result as { resultCode?: number; message?: string };
    if (response.resultCode === 1) {
        return response.message || 'Ошибка сохранения реквизитов';
    }
    return null;
};

const getStoredRqId = (result: unknown): number | null => {
    if (!result || typeof result !== 'object') {
        return null;
    }

    const maybeWithData = result as { data?: { bx_id?: number } };
    const bxId = maybeWithData.data?.bx_id;
    return typeof bxId === 'number' ? bxId : null;
};

export const fetchBXRQ =
    (domain: string, companyId: number, currentRqId?: number) =>
        async (dispatch: AppThunkDispatch, getState: AppThunkGetState) => {
            const state = getState();

            const isLoading = state.bxrq.isLoading;
            if (!isLoading) {
                dispatch(setLoading(true));
                dispatch(setRequiredUnderstand({ status: false }));

                const rqRequestData = {
                    domain,
                    company_id: companyId,
                    iswait: true,
                };

                const rqData = (await eventServiceAPI.service(
                    EVS_ENDPOINT.GET_RQS,
                    API_METHOD.POST,
                    rqRequestData,
                )) as EvsResponse | null;

                if (rqData) {
                    if (rqData.rqs) {
                        dispatch(
                            setFetched({
                                bxrq: rqData.rqs,
                                currentRqId: currentRqId,
                            }),
                        );

                        return;
                    }
                }
                dispatch(setFetchedStatus(true));
            }
        };

export const saveBXRQ =
    (
        domain: string,
        companyId: number,
        currentClientType: RQ_TYPE,
        // contractType: CONTRACT_LTYPE,
        // supplyType: SupplyTypesType,
    ) =>
        async (dispatch: AppThunkDispatch, getState: AppThunkGetState) => {
            dispatch(cleanError({ code: 'save' }));
            dispatch(setCreatingLoadingStatus(true));
            dispatch(setRequiredUnderstand({ status: false }));
            try {
                const state = getState();

                const rqsState = state.bxrq as BXRQState;

                const rqCreatingBase = rqsState.creating.base;
                const resolvedType = getResolvedType(
                    currentClientType,
                ) as ResolvedRQType;

                if (!(rqsState && rqsState.rqs && rqCreatingBase)) {
                    dispatch(setCreatingLoadingStatus(false));
                    return;
                }
                const fields = filterFieldItems(
                    rqCreatingBase.fields,
                    currentClientType,
                    // contractType,
                    // supplyType,
                );

                // const entityTypeId = getEntityTypeId(currentClientType);
                const presetId = rqCreatingBase.preset_id;
                const data = {
                    domain,
                    company_id: companyId,
                    preset_id: presetId,
                    bx_id: rqCreatingBase.bx_id, // -1 если новый
                    rq: {
                        fields,
                    },
                    iswait: true,
                };

                const result = (await eventServiceAPI.service(
                    EVS_ENDPOINT.STORE_RQ,
                    API_METHOD.POST,
                    data,
                )) as RQStore | null;
                const apiError = getApiErrorMessage(result);
                if (apiError) {
                    throw new Error(apiError);
                }
                if (!result) {
                    throw new Error('Ошибка сохранения реквизитов');
                }

                let rq_id = rqCreatingBase.bx_id;
                const storedRqId = getStoredRqId(result);
                if (storedRqId && storedRqId > 0) {
                    rq_id = storedRqId;
                }

                const currentItem = {
                    ...rqsState.current.item,
                    bx_id: rq_id,
                    fields: fields,
                };

                const currentItems = rqsState.current.items.map(
                    (item: EvsRqItem) => {
                        if (item.bx_id == -1 || item.bx_id == rq_id) {
                            return { ...item, bx_id: rq_id, fields: fields };
                        }
                        return item;
                    },
                );

                const updatedState = {
                    ...rqsState,
                    creating: {
                        ...rqsState.creating,
                        base: null,
                        simpleBankComment: '',
                    },
                    current: {
                        ...rqsState.current,
                        item: currentItem,
                        items: currentItems,
                    },
                    rqs: {
                        ...rqsState.rqs,
                        [resolvedType]: {
                            ...rqsState.rqs[resolvedType],
                            items: currentItems,
                        },
                    },
                } as BXRQState;

                const simpleBankComment =
                    rqsState.creating.simpleBankComment?.trim() ?? '';
                const isSimpleBankCommentMode =
                    rqsState.settings?.isSimpleBankCommentMode ?? false;
                const currentBank =
                    currentItem.bank?.current || currentItem.bank?.items?.[0];
                const currentBankComment = (
                    currentBank?.fields?.find(
                        field => field.code === BANK_RQ_ITEM_CODE.BANK_COMMENTS,
                    )?.value || ''
                )
                    .toString()
                    .trim();
                const shouldSaveSimpleBankComment =
                    isSimpleBankCommentMode &&
                    (Boolean(simpleBankComment) ||
                        simpleBankComment !== currentBankComment);

                if (shouldSaveSimpleBankComment) {
                    const sourceBankFields = currentBank?.fields || [];
                    let bankFieldsWithComment = updateBankFieldValue(
                        sourceBankFields,
                        BANK_RQ_ITEM_CODE.BANK_COMMENTS,
                        simpleBankComment,
                    );

                    const bankNameField = bankFieldsWithComment.find(
                        field => field.code === BANK_RQ_ITEM_CODE.BANK_NAME,
                    );
                    if (
                        bankNameField &&
                        bankNameField.type !== 'select' &&
                        bankNameField.type !== 'file' &&
                        !(bankNameField.value || '').trim()
                    ) {
                        bankFieldsWithComment = updateBankFieldValue(
                            bankFieldsWithComment,
                            BANK_RQ_ITEM_CODE.BANK_NAME,
                            'Банк',
                        );
                    }

                    const bankPayload: BankRqItem = {
                        id:
                            currentBank && currentBank.id > 0
                                ? currentBank.id
                                : -1,
                        fields: bankFieldsWithComment,
                    };

                    const bankResult = (await eventServiceAPI.service(
                        EVS_ENDPOINT.STORE_RQ,
                        API_METHOD.POST,
                        {
                            domain,
                            company_id: companyId,
                            bx_id: rq_id,
                            bank: bankPayload,
                            iswait: true,
                        },
                    )) as { data: number } | null;
                    const bankApiError = getApiErrorMessage(bankResult);
                    if (bankApiError) {
                        throw new Error(bankApiError);
                    }
                    if (!bankResult) {
                        throw new Error('Ошибка сохранения банковских реквизитов');
                    }

                    const newBankId = bankResult?.data || bankPayload.id;
                    const updatedBank = {
                        ...bankPayload,
                        id: newBankId,
                    };

                    updatedState.current.item = {
                        ...updatedState.current.item!,
                        bank: {
                            ...updatedState.current.item!.bank,
                            items: [updatedBank],
                            current: updatedBank,
                            fields: updatedBank.fields,
                        },
                    };

                    updatedState.current.items = updatedState.current.items.map(
                        item => {
                            if (item.bx_id === updatedState.current.item!.bx_id) {
                                return updatedState.current.item!;
                            }
                            return item;
                        },
                    );

                    const currentRqs = updatedState.rqs!;
                    updatedState.rqs = {
                        ...currentRqs,
                        [resolvedType]: {
                            ...currentRqs[resolvedType],
                            items: updatedState.current.items,
                        },
                    };
                }

                dispatch(saveBaseCreating({ updatedState }));
                dispatch(setCreatingLoadingStatus(false));
            }
            catch (error) {
                dispatch(
                    setError({
                        code: 'save',
                        value: getSaveErrorMessage(error),
                    }),
                );
                dispatch(setCreatingLoadingStatus(false));
            }
        };

export const saveAddress =
    (
        domain: string,
        companyId: number,
        currentClientType: RQ_TYPE,
        typeId: BX_ADDRESS_TYPE,
    ) =>
        async (dispatch: AppThunkDispatch, getState: AppThunkGetState) => {
            dispatch(cleanError({ code: 'save' }));
            const state = getState();
            // const domain = state.app.domain;
            // const companyId = state.app.company;
            // const clientTypestate = state.documentClientType as ClientTypeState;
            // const currentClientTypeItem = clientTypestate.current;
            const rqsState = state.bxrq as BXRQState;

            const resolvedType = getResolvedType(
                currentClientType,
            ) as ResolvedRQType;

            dispatch(setRequiredUnderstand({ status: false }));

            const addressCreating = rqsState.creating.address as AddressRqItem;
            const rq = rqsState.current.item;

            if (rqsState && rqsState.rqs && addressCreating && rq) {
                try {
                const rq_id = rq.bx_id;
                const data = {
                    domain,
                    company_id: companyId,
                    bx_id: rq_id,
                    address: addressCreating,
                    iswait: true,
                };

                dispatch(setCreatingLoadingStatus(true));

                const result = (await eventServiceAPI.service(
                    EVS_ENDPOINT.STORE_RQ,
                    API_METHOD.POST,
                    data,
                )) as RQStore | null;
                const apiError = getApiErrorMessage(result);
                if (apiError) {
                    throw new Error(apiError);
                }
                if (!result) {
                    throw new Error('Ошибка сохранения адреса');
                }

                let address_id = addressCreating.id;
                // if (result && result.data.id) {
                //   address_id = result.data.id;
                // }

                const updatedAddress = {
                    ...addressCreating,
                    id: address_id,
                };

                // Обновляем адреса в текущем элементе
                const updatedCurrentItem = {
                    ...rq,
                    address: {
                        ...rq.address,
                        items: rq.address.items.map((ad: AddressRqItem) => {
                            if (ad.type_id === typeId) {
                                return updatedAddress;
                            }
                            return ad;
                        }),
                    },
                };

                // Обновляем элементы в current.items
                const updatedCurrentItems = rqsState.current.items.map(
                    (rqItem: EvsRqItem) => {
                        if (rqItem.bx_id === rq.bx_id) {
                            return updatedCurrentItem;
                        }
                        return rqItem;
                    },
                );

                // Обновляем rqs
                const updatedRqs = {
                    ...rqsState.rqs,
                    [resolvedType]: {
                        ...rqsState.rqs[resolvedType],
                        items: updatedCurrentItems,
                    },
                };

                const updatedState = {
                    ...rqsState,
                    creating: {
                        ...rqsState.creating,
                        address: null,
                    },
                    current: {
                        ...rqsState.current,
                        item: updatedCurrentItem,
                        items: updatedCurrentItems,
                    },
                    rqs: updatedRqs,
                } as BXRQState;

                dispatch(
                    saveAddressCreating({ typeId, clientType: currentClientType }),
                );
                dispatch(setCreatingLoadingStatus(false));
                } catch (error) {
                    dispatch(
                        setError({
                            code: 'save',
                            value: getSaveErrorMessage(error),
                        }),
                    );
                    dispatch(setCreatingLoadingStatus(false));
                }
            }
        };

export const saveBank =
    (
        domain: string,
        companyId: number,
        // bankId: number,
    ) =>
        async (dispatch: AppThunkDispatch, getState: AppThunkGetState) => {
            dispatch(cleanError({ code: 'save' }));
            const state = getState();
            // const domain = state.app.domain;
            // const companyId = state.app.company;
            const rqsState = state.bxrq as BXRQState;

            dispatch(setRequiredUnderstand({ status: false }));

            const bankCreating = rqsState.creating.bank;
            const rq = rqsState.current.item;

            if (rqsState && rqsState.rqs && bankCreating && rq) {
                try {
                const rq_id = rq.bx_id;
                const data = {
                    domain,
                    company_id: companyId,
                    bx_id: rq_id,
                    bank: bankCreating,
                    iswait: true,
                };

                dispatch(setCreatingLoadingStatus(true));

                const result = (await eventServiceAPI.service(
                    EVS_ENDPOINT.STORE_RQ,
                    API_METHOD.POST,
                    data,
                )) as { data: number } | null;
                const apiError = getApiErrorMessage(result);
                if (apiError) {
                    throw new Error(apiError);
                }
                if (!result) {
                    throw new Error('Ошибка сохранения банковских реквизитов');
                }

                let newBankId = result?.data || bankCreating.id;

                // if (result && result.data.id) {
                //   newBankId = result.data.id;
                // }

                const updatedBank = {
                    ...bankCreating,
                    id: newBankId,
                };

                // Обновляем банк в текущем элементе
                const updatedCurrentItem = {
                    ...rq,
                    bank: {
                        ...rq.bank,
                        items: [updatedBank],
                        current: updatedBank,
                    },
                };

                // Обновляем элементы в current.items
                const updatedCurrentItems = rqsState.current.items.map(
                    (rqItem: EvsRqItem) => {
                        if (rqItem.bx_id === rq.bx_id) {
                            return updatedCurrentItem;
                        }
                        return rqItem;
                    },
                );

                const updatedState = {
                    ...rqsState,
                    creating: {
                        ...rqsState.creating,
                        bank: null,
                    },
                    current: {
                        ...rqsState.current,
                        item: updatedCurrentItem,
                        items: updatedCurrentItems,
                    },
                    rqs: {
                        ...rqsState.rqs,
                        [getResolvedType(RQ_TYPE.ORGANIZATION) as ResolvedRQType]: {
                            ...rqsState.rqs[
                            getResolvedType(
                                RQ_TYPE.ORGANIZATION,
                            ) as ResolvedRQType
                            ],
                            items: updatedCurrentItems,
                        },
                    },
                } as BXRQState;

                dispatch(
                    saveBankCreating({
                        bankId: newBankId,
                        clientType: RQ_TYPE.ORGANIZATION,
                    }),
                );
                dispatch(setCreatingLoadingStatus(false));
                } catch (error) {
                    dispatch(
                        setError({
                            code: 'save',
                            value: getSaveErrorMessage(error),
                        }),
                    );
                    dispatch(setCreatingLoadingStatus(false));
                }
            }
        };

export const setBasePropThunk =
    (code: string, value: string) =>
        async (dispatch: AppThunkDispatch, getState: AppThunkGetState) => {
            dispatch(setBasePropAction({ code, value }));
        };

export const blurCase =
    (code: string, value: string) =>
        async (dispatch: AppThunkDispatch, getState: AppThunkGetState) => {
            const state = getState();

            if (state.bxrq.caseLoading.includes(code)) {
                return;
            }

            if (
                code == 'first_name' ||
                code == 'last_name' ||
                code == 'second_name'
            ) {
                const creatingItem = (state.bxrq as BXRQState).creating.base;
                if (creatingItem?.fields) {
                    const currentFullname = getFullName(
                        creatingItem?.fields,
                    ).fullName;
                    const currentIPFullname = `Индивидуальный Предприниматель ${currentFullname}`;
                    const currentIPFullShortname = `ИП ${getFullName(creatingItem?.fields).initials}`;

                    dispatch(
                        setBasePropAction({
                            code: RQ_ITEM_CODE.PERSON_NAME,
                            value: currentFullname,
                        }),
                    );
                    dispatch(
                        setBasePropAction({
                            code: RQ_ITEM_CODE.FULLNAME,
                            value: currentIPFullname,
                        }),
                    );
                    dispatch(
                        setBasePropAction({
                            code: RQ_ITEM_CODE.SHORTNAME,
                            value: currentIPFullShortname,
                        }),
                    );
                }
            }

            if (code == 'director' || code == 'position' || code == 'based') {
                const caseCode = `${code}_case`;
                dispatch(setCaseLoading({ code: caseCode }));
                if (
                    code == 'based' &&
                    (value.toLocaleLowerCase() === 'устав' ||
                        value.toLocaleLowerCase() === 'устава')
                ) {
                    let casedValue = 'Устава';
                    dispatch(
                        setBasePropAction({ code: caseCode, value: casedValue }),
                    );
                } else {
                    const caseValue = (await eventServiceAPI.service(
                        EVS_ENDPOINT.CASE,
                        API_METHOD.POST,
                        { value },
                    )) as { case: string } | null;

                    let casedValue = value;
                    if (caseValue?.case) {
                        casedValue = caseValue?.case;
                    }
                    dispatch(
                        setBasePropAction({ code: caseCode, value: casedValue }),
                    );
                }

                dispatch(setCaseLoading({ code: caseCode }));
            }
        };
