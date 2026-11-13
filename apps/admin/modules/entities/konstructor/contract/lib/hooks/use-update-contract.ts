'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ContractHelper } from '../api/contract-helper';
import type { ContractUpdate } from '../../model';
import { CONTRACTS_QUERY_KEY } from './contract-query-key';

const helper = new ContractHelper();

export interface UpdateContractVars {
    id: number;
    dto: ContractUpdate;
}

/** Правка вида договора; после ответа перечитываем справочник и запись. */
export const useUpdateContract = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, dto }: UpdateContractVars) => helper.update(id, dto),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: CONTRACTS_QUERY_KEY }),
    });
};
