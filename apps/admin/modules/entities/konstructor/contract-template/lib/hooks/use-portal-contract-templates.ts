'use client';

import { useQuery } from '@tanstack/react-query';
import { CONTRACT_TEMPLATE_LIST_CASH_KEY } from '../../consts/contract-template.consts';
import { ContractTemplateHelper } from '../api/contract-template.helper';

const helper = new ContractTemplateHelper();

/** Шаблоны портала ПЛЮС унаследованные общие — так отвечает бэкенд. */
export const usePortalContractTemplates = (portalId: string) => {
    return useQuery({
        queryKey: [CONTRACT_TEMPLATE_LIST_CASH_KEY, 'portal', portalId],
        queryFn: () => helper.listByPortal(portalId),
        enabled: !!portalId,
    });
};
