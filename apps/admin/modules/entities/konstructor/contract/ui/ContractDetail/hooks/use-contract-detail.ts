'use client';

import { useState } from 'react';
import { formatFieldValue, type FieldRow } from '@/modules/entities/konstructor/lib';
import { useContract } from '../../../lib/hooks';
import { CONTRACT_FIELD_LABELS } from '../../../model';

/** Страница вида договора: запись, строки полей, окно правки. */
export const useContractDetail = (id: number) => {
    const contract = useContract(id);
    const [editing, setEditing] = useState(false);

    const rows: FieldRow[] = contract.data
        ? CONTRACT_FIELD_LABELS.map(field => ({
              label: field.label,
              value: formatFieldValue(contract.data[field.key]),
          }))
        : [];

    return {
        contract: contract.data,
        isLoading: contract.isLoading,
        isError: contract.isError,
        heading: contract.data?.name || contract.data?.title || `Договор #${id}`,
        rows,
        editing,
        setEditing,
    };
};
