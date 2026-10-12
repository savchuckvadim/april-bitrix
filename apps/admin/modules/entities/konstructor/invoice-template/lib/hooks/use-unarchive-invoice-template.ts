'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    INVOICE_TEMPLATE_ITEM_CASH_KEY,
    INVOICE_TEMPLATE_LIST_CASH_KEY,
} from '../../consts/invoice-template.consts';
import { InvoiceTemplateHelper } from '../api/invoice-template.helper';

const helper = new InvoiceTemplateHelper();

/** Из архива. Флаг «по умолчанию» бэк при разархивации НЕ возвращает. */
export const useUnarchiveInvoiceTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => helper.unarchive(id),
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
