'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    contractDocumentActions,
    selectContractUnitState,
    type ContractFormField,
    type ContractSpecificationItem,
} from '@/modules/entities/contract-document';
import { useSpecificationView } from './use-specification-view';

const NO_ITEMS: ContractSpecificationItem[] = [];
const NO_FIELDS: ContractFormField[] = [];

/**
 * Спецификация договорной единицы: те же основные строки, суммы и подробности,
 * что у живого договора, но значения и правки свои. Вся спецификация
 * сворачивается: карточек в списке несколько, и свёрнутая карточка короче.
 */
export const useContractUnitSpecification = (unitKey: string) => {
    const dispatch = useAppDispatch();
    const unit = useAppSelector(state => selectContractUnitState(state, unitKey));
    const [isOpen, setOpen] = useState(false);

    const view = useSpecificationView({
        status: unit?.formStatus ?? 'idle',
        error: unit?.formError ?? null,
        specification: unit?.specification ?? NO_ITEMS,
        contractForm: unit?.contractForm ?? NO_FIELDS,
        onChange: (code, value) =>
            dispatch(contractDocumentActions.unitSpecificationValue({ key: unitKey, code, value })),
    });

    return { ...view, isOpen, setOpen };
};
