'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    INVOICE_TEMPLATE_ITEM_CASH_KEY,
    INVOICE_TEMPLATE_LIST_CASH_KEY,
} from '../../consts/invoice-template.consts';
import { InvoiceTemplateHelper } from '../api/invoice-template.helper';

const helper = new InvoiceTemplateHelper();

/**
 * В архив. Архивный шаблон исчезает из списка без фильтра `is_archived=true`,
 * поэтому инвалидируется весь список.
 */
export const useArchiveInvoiceTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => helper.archive(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({
                queryKey: [INVOICE_TEMPLATE_LIST_CASH_KEY],
            });
            queryClient.invalidateQueries({
                queryKey: [INVOICE_TEMPLATE_ITEM_CASH_KEY, id],
            });
        },
    });
};
