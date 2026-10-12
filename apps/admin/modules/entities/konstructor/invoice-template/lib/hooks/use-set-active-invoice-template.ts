'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    INVOICE_TEMPLATE_ITEM_CASH_KEY,
    INVOICE_TEMPLATE_LIST_CASH_KEY,
} from '../../consts/invoice-template.consts';
import { InvoiceTemplateHelper } from '../api/invoice-template.helper';

const helper = new InvoiceTemplateHelper();

/**
 * Флаг передаётся ЯВНО: эндпоинт принимает `is_active` в теле, а не
 * переключает значение сам. Вызывающий передаёт желаемое состояние.
 */
export const useSetActiveInvoiceTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
            helper.setActive(id, isActive),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: [INVOICE_TEMPLATE_LIST_CASH_KEY],
            });
            queryClient.invalidateQueries({
                queryKey: [INVOICE_TEMPLATE_ITEM_CASH_KEY, variables.id],
            });
        },
    });
};
