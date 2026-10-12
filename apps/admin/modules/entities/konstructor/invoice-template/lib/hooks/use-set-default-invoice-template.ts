'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    INVOICE_TEMPLATE_ITEM_CASH_KEY,
    INVOICE_TEMPLATE_LIST_CASH_KEY,
} from '../../consts/invoice-template.consts';
import { InvoiceTemplateHelper } from '../api/invoice-template.helper';

const helper = new InvoiceTemplateHelper();

/**
 * Шаблон по умолчанию в своей группе (visibility+portal+agent). Бэк снимает
 * флаг с остальных шаблонов группы, поэтому инвалидируется весь список.
 */
export const useSetDefaultInvoiceTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, isDefault }: { id: string; isDefault: boolean }) =>
            helper.setDefault(id, isDefault),
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
