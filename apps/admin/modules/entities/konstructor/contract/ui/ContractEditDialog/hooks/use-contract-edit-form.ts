'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import { useUpdateContract } from '../../../lib/hooks/use-update-contract';
import {
    missingRequiredFields,
    toContractDraft,
    toContractUpdate,
} from '../../../lib/utils/contract-edit.util';
import type { Contract, ContractDraft, ContractTextKey } from '../../../model';

/** Форма правки вида договора: черновик, проверка, сохранение по ответу бэка. */
export const useContractEditForm = (
    contract: Contract,
    open: boolean,
    onSaved: () => void,
) => {
    const update = useUpdateContract();
    const [draft, setDraft] = useState<ContractDraft>(() => toContractDraft(contract));

    // каждое открытие — с актуальной записи, без хвостов прошлой правки
    useEffect(() => {
        if (open) setDraft(toContractDraft(contract));
    }, [open, contract]);

    const setField = (key: ContractTextKey, value: string) =>
        setDraft(current => ({ ...current, [key]: value }));

    const changes = toContractUpdate(contract, draft);
    const missing = missingRequiredFields(draft);
    const hasChanges = Object.keys(changes).length > 0;

    const submit = async () => {
        if (!hasChanges || missing.length) return;
        try {
            await update.mutateAsync({ id: contract.id, dto: changes });
            toast.success('Вид договора сохранён');
            onSaved();
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Не удалось сохранить вид договора'));
        }
    };

    return {
        draft,
        setField,
        missingKeys: missing.map(field => field.key),
        canSubmit: hasChanges && !missing.length && !update.isPending,
        isSubmitting: update.isPending,
        submit,
    };
};
