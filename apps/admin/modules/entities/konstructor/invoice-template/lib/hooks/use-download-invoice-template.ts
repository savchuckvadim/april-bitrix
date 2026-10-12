'use client';

import { useMutation } from '@tanstack/react-query';
import { InvoiceTemplateHelper } from '../api/invoice-template.helper';

const helper = new InvoiceTemplateHelper();

export const useDownloadInvoiceTemplate = () =>
    useMutation({
        mutationFn: (id: string) => helper.download(id),
    });
