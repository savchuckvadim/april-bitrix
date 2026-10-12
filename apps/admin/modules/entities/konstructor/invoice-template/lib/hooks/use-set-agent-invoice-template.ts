'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    INVOICE_TEMPLATE_ITEM_CASH_KEY,
    INVOICE_TEMPLATE_LIST_CASH_KEY,
} from '../../consts/invoice-template.consts';
import { InvoiceTemplateHelper } from '../api/invoice-template.helper';

const helper = new InvoiceTemplateHelper();

/** `agentId: null` — отвязать поставщика. ID остаётся строкой. */
export const useSetAgentInvoiceTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, agentId }: { id: string; agentId: string | null }) =>
            helper.setAgent(id, agentId),
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
