'use client';

import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    CONTRACT_DEAL_FIELDS,
    contractDocumentActions,
    saveContractDealField,
    selectContractDealFields,
    type ContractDealField,
} from '@/modules/entities/contract-document';

/** Поля сделки Bitrix для документа: правка в состоянии, запись в Bitrix по blur. */
export const useContractDealFields = (definitions: ContractDealField[] = CONTRACT_DEAL_FIELDS) => {
    const dispatch = useAppDispatch();
    const values = useAppSelector(selectContractDealFields);
    const savingField = useAppSelector(state => state.contractDocument.savingField);
    const saveError = useAppSelector(state => state.contractDocument.saveError);
    const contractNumber = useAppSelector(state => state.contractDocument.contractNumber);
    const hasDeal = useAppSelector(state => Boolean(state.app.dealId));

    return {
        fields: definitions.map(field => ({ ...field, value: values[field.code] ?? '' })),
        savingField,
        saveError,
        // без сделки запись в Bitrix невозможна — поля только для документа
        hasDeal,
        setValue: (code: string, value: string) => dispatch(contractDocumentActions.setDealField({ code, value })),
        save: (code: string) => void dispatch(saveContractDealField(code)),
        contractNumber,
        setContractNumber: (value: string) => dispatch(contractDocumentActions.setContractNumber(value)),
    };
};
