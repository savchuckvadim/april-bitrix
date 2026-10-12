'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { INVOICE_TEMPLATE_LIST_CASH_KEY } from '../../consts/invoice-template.consts';
import { InvoiceTemplateHelper } from '../api/invoice-template.helper';

const helper = new InvoiceTemplateHelper();

export const useRemoveInvoiceTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => helper.remove(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [INVOICE_TEMPLATE_LIST_CASH_KEY],
            });
        },
    });
};
