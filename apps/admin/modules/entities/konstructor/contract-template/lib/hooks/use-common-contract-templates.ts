'use client';

import { useQuery } from '@tanstack/react-query';
import { CONTRACT_TEMPLATE_LIST_CASH_KEY } from '../../consts/contract-template.consts';
import { ContractTemplateHelper } from '../api/contract-template.helper';

const helper = new ContractTemplateHelper();

/** Только общие шаблоны (portal_id IS NULL). */
export const useCommonContractTemplates = () => {
    return useQuery({
        queryKey: [CONTRACT_TEMPLATE_LIST_CASH_KEY, 'common'],
        queryFn: () => helper.listCommon(),
    });
};
