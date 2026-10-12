'use client';

import { useQuery } from '@tanstack/react-query';
import { INVOICE_TEMPLATE_LIST_CASH_KEY } from '../../consts/invoice-template.consts';
import { InvoiceTemplateHelper } from '../api/invoice-template.helper';

const helper = new InvoiceTemplateHelper();

export const usePortalInvoiceTemplates = (portalId: string) =>
    useQuery({
        queryKey: [INVOICE_TEMPLATE_LIST_CASH_KEY, 'portal', portalId],
        queryFn: () => helper.findByPortal(portalId),
        enabled: !!portalId,
    });
