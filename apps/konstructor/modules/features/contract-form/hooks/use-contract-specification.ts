'use client';

import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    contractDocumentActions,
    fetchContractForm,
    selectContractForm,
    selectContractFormStatus,
    selectVisibleSpecification,
} from '@/modules/entities/contract-document';

const SUM_CODES = ['month_sum', 'prepayment_sum', 'period_sum'] as const;

/** Спецификация договора (правится) и суммы общей формы (справка). */
export const useContractSpecification = () => {
    const dispatch = useAppDispatch();
    const status = useAppSelector(selectContractFormStatus);
    const error = useAppSelector(state => state.contractDocument.formError);
    const items = useAppSelector(selectVisibleSpecification);
    const contractForm = useAppSelector(selectContractForm);

    const sums = SUM_CODES.flatMap(code => {
        const field = contractForm.find(item => (item as { code?: string }).code === code);
        return field ? [{ code, label: field.name, value: typeof field.value === 'string' ? field.value : '' }] : [];
    });

    return {
        isLoading: status === 'loading' || status === 'idle',
        error: status === 'error' ? error : null,
        items,
        sums,
        setValue: (code: string, value: string) =>
            dispatch(contractDocumentActions.setSpecificationValue({ code, value })),
        reload: () => void dispatch(fetchContractForm()),
    };
};
