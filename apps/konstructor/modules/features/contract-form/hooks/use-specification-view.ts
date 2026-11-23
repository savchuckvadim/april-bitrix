'use client';

import { useMemo, useState } from 'react';
import {
    specificationDetails,
    visibleSpecification,
    type ContractFormField,
    type ContractFormStatus,
    type ContractSpecificationItem,
} from '@/modules/entities/contract-document';
import { groupSpecificationDetails, specificationSums } from '../lib/specification-sections.util';

/** Откуда редактор спецификации берёт значения и куда пишет правки: живой договор или единица. */
export interface SpecificationSource {
    status: ContractFormStatus;
    error: string | null;
    specification: readonly ContractSpecificationItem[];
    contractForm: readonly ContractFormField[];
    onChange: (code: string, value: string) => void;
}

/**
 * Спецификация договора для показа: основные строки (правятся), суммы общей
 * формы и подробности по разделам. Одна логика на живой договор и на каждую
 * договорную единицу, различается только источник значений.
 */
export const useSpecificationView = ({ status, error, specification, contractForm, onChange }: SpecificationSource) => {
    const [isExpanded, setExpanded] = useState(false);
    const items = useMemo(() => visibleSpecification(specification), [specification]);
    const sections = useMemo(() => groupSpecificationDetails(specificationDetails(specification)), [specification]);
    const sums = useMemo(() => specificationSums(contractForm), [contractForm]);

    return {
        isLoading: status === 'loading' || status === 'idle',
        error: status === 'error' ? error : null,
        items,
        sums,
        sections,
        isExpanded,
        setExpanded,
        setValue: onChange,
    };
};

export type SpecificationView = ReturnType<typeof useSpecificationView>;
