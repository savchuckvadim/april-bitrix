'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    INVOICE_TEMPLATE_ITEM_CASH_KEY,
    INVOICE_TEMPLATE_LIST_CASH_KEY,
} from '../../consts/invoice-template.consts';
import { InvoiceTemplateHelper } from '../api/invoice-template.helper';

const helper = new InvoiceTemplateHelper();

/** `portalId: null` — отвязать портал. ID остаётся строкой. */
export const useSetPortalInvoiceTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, portalId }: { id: string; portalId: string | null }) =>
            helper.setPortal(id, portalId),
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
