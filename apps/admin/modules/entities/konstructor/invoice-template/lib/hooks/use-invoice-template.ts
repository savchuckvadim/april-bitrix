'use client';

import { useQuery } from '@tanstack/react-query';
import { INVOICE_TEMPLATE_ITEM_CASH_KEY } from '../../consts/invoice-template.consts';
import { InvoiceTemplateHelper } from '../api/invoice-template.helper';

const helper = new InvoiceTemplateHelper();

export const useInvoiceTemplate = (id: string) =>
    useQuery({
        queryKey: [INVOICE_TEMPLATE_ITEM_CASH_KEY, id],
        queryFn: () => helper.get(id),
        enabled: !!id,
    });
