'use client';

import { useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    contractDocumentActions,
    selectContractForm,
    selectContractFormStatus,
    selectSpecificationDetails,
    selectVisibleSpecification,
} from '@/modules/entities/contract-document';
import { groupSpecificationDetails } from '../lib/specification-sections.util';

const SUM_CODES = ['month_sum', 'prepayment_sum', 'period_sum'] as const;

/**
 * Спецификация договора: основные строки (правятся), суммы общей формы и
 * подробности по разделам — инфоблоки, энциклопедии решений, Legal Tech.
 * Форма запрашивается заново на каждом входе на экран, отдельная кнопка
 * пересборки не нужна.
 */
export const useContractSpecification = () => {
    const dispatch = useAppDispatch();
    const status = useAppSelector(selectContractFormStatus);
    const error = useAppSelector(state => state.contractDocument.formError);
    const items = useAppSelector(selectVisibleSpecification);
    const details = useAppSelector(selectSpecificationDetails);
    const contractForm = useAppSelector(selectContractForm);
    const [isExpanded, setExpanded] = useState(false);
    const sections = useMemo(() => groupSpecificationDetails(details), [details]);

    const sums = SUM_CODES.flatMap(code => {
        const field = contractForm.find(item => (item as { code?: string }).code === code);
        return field ? [{ code, label: field.name, value: typeof field.value === 'string' ? field.value : '' }] : [];
    });

    return {
        isLoading: status === 'loading' || status === 'idle',
        error: status === 'error' ? error : null,
        items,
        sums,
        sections,
        isExpanded,
        setExpanded,
        setValue: (code: string, value: string) =>
            dispatch(contractDocumentActions.setSpecificationValue({ code, value })),
    };
};
