'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { INVOICE_TEMPLATE_LIST_CASH_KEY } from '../../consts/invoice-template.consts';
import { InvoiceTemplateHelper } from '../api/invoice-template.helper';
import type { ICreateInvoiceTemplateDto } from '../../model';

const helper = new InvoiceTemplateHelper();

export const useCreateInvoiceTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: ICreateInvoiceTemplateDto) => helper.create(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [INVOICE_TEMPLATE_LIST_CASH_KEY],
            });
        },
    });
};
