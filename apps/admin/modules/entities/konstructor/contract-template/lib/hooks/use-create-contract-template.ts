'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CONTRACT_TEMPLATE_LIST_CASH_KEY } from '../../consts/contract-template.consts';
import { ContractTemplateHelper } from '../api/contract-template.helper';
import type { ICreateContractTemplateDto } from '../../model';

const helper = new ContractTemplateHelper();

export const useCreateContractTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: ICreateContractTemplateDto) => helper.create(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [CONTRACT_TEMPLATE_LIST_CASH_KEY],
            });
        },
    });
};
