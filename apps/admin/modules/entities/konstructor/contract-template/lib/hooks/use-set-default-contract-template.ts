'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    CONTRACT_TEMPLATE_ITEM_CASH_KEY,
    CONTRACT_TEMPLATE_LIST_CASH_KEY,
} from '../../consts/contract-template.consts';
import { ContractTemplateHelper } from '../api/contract-template.helper';

const helper = new ContractTemplateHelper();

/**
 * Установка флага снимает его у остальных шаблонов ТОЙ ЖЕ области
 * (портал + поставщик + ТИП ДОГОВОРА) — поэтому инвалидируется весь список,
 * а не только изменённая строка.
 */
export const useSetDefaultContractTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, isDefault }: { id: string; isDefault: boolean }) =>
            helper.setDefault(id, isDefault),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: [CONTRACT_TEMPLATE_LIST_CASH_KEY],
            });
            queryClient.invalidateQueries({
                queryKey: [CONTRACT_TEMPLATE_ITEM_CASH_KEY, variables.id],
            });
        },
    });
};
