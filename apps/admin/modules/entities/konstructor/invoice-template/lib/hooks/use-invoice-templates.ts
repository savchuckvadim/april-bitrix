'use client';

import { useQuery } from '@tanstack/react-query';
import { INVOICE_TEMPLATE_LIST_CASH_KEY } from '../../consts/invoice-template.consts';
import { InvoiceTemplateHelper } from '../api/invoice-template.helper';
import type { IInvoiceTemplateFindAllParams } from '../../model';

const helper = new InvoiceTemplateHelper();

/**
 * Список шаблонов счетов. Фильтры уходят в query — переключение фильтра
 * меняет queryKey и перезапрашивает список, а не фильтрует полученный массив.
 */
export const useInvoiceTemplates = (params: IInvoiceTemplateFindAllParams = {}) =>
    useQuery({
        queryKey: [INVOICE_TEMPLATE_LIST_CASH_KEY, params],
        queryFn: () => helper.list(params),
    });
