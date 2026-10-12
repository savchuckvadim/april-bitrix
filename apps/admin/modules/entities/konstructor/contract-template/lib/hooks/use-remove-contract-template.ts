'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CONTRACT_TEMPLATE_LIST_CASH_KEY } from '../../consts/contract-template.consts';
import { ContractTemplateHelper } from '../api/contract-template.helper';

const helper = new ContractTemplateHelper();

export const useRemoveContractTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => helper.remove(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [CONTRACT_TEMPLATE_LIST_CASH_KEY],
            });
        },
    });
};
