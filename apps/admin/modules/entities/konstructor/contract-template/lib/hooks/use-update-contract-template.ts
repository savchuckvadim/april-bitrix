'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    CONTRACT_TEMPLATE_ITEM_CASH_KEY,
    CONTRACT_TEMPLATE_LIST_CASH_KEY,
} from '../../consts/contract-template.consts';
import { ContractTemplateHelper } from '../api/contract-template.helper';
import type { IUpdateContractTemplateDto } from '../../model';

const helper = new ContractTemplateHelper();

export interface UpdateContractTemplateVars {
    id: string;
    dto: IUpdateContractTemplateDto;
    /** Необязательная замена файлов: без них PATCH уходит JSON-ом. */
    files?: { file?: File | null; demo?: File | null };
}

export const useUpdateContractTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, dto, files }: UpdateContractTemplateVars) =>
            helper.update(id, dto, files),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: [CONTRACT_TEMPLATE_LIST_CASH_KEY],
            });
            queryClient.invalidateQueries({
                queryKey: [CONTRACT_TEMPLATE_ITEM_CASH_KEY, variables.id],
            });
        },
    });
};
