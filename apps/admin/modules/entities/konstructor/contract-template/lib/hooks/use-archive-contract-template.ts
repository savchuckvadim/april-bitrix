'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    CONTRACT_TEMPLATE_ITEM_CASH_KEY,
    CONTRACT_TEMPLATE_LIST_CASH_KEY,
} from '../../consts/contract-template.consts';
import { ContractTemplateHelper } from '../api/contract-template.helper';

const helper = new ContractTemplateHelper();

/**
 * Архивация снимает `is_default` (иначе область «по умолчанию» указывала бы
 * на строку, которой резолвер не видит). Разархивация его НЕ возвращает —
 * сознательное решение бэкенда, после разархивации флаг ставится заново.
 */
export const useArchiveContractTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, archived }: { id: string; archived: boolean }) =>
            archived ? helper.archive(id) : helper.unarchive(id),
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
