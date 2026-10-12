'use client';

import { useQuery } from '@tanstack/react-query';
import { CONTRACT_TEMPLATE_ITEM_CASH_KEY } from '../../consts/contract-template.consts';
import { ContractTemplateHelper } from '../api/contract-template.helper';

const helper = new ContractTemplateHelper();

export const useContractTemplate = (id: string) => {
    return useQuery({
        queryKey: [CONTRACT_TEMPLATE_ITEM_CASH_KEY, id],
        queryFn: () => helper.get(id),
        enabled: !!id,
    });
};
