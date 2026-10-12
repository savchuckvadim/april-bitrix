'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    CONTRACT_TEMPLATE_ITEM_CASH_KEY,
    CONTRACT_TEMPLATE_LIST_CASH_KEY,
} from '../../consts/contract-template.consts';
import { ContractTemplateHelper } from '../api/contract-template.helper';

const helper = new ContractTemplateHelper();

/**
 * Флаг передаётся ЯВНО: у бэкенда `is_active` в теле обязателен, ручка не
 * переключает значение сама. Вызывающий код отправляет `!row.is_active`.
 */
export const useSetActiveContractTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
            helper.setActive(id, isActive),
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
