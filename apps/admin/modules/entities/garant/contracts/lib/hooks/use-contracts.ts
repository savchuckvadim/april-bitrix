'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    ContractResponseDto,
    CreateContractDto,
    UpdateContractDto
} from '@workspace/nest-api';
import { ContractHelper } from '../api/contracts-helper';

const contractHelper = new ContractHelper();

export const useContracts = () => {
    return useQuery<ContractResponseDto[], Error>({
        queryKey: ['contracts'],
        queryFn: async () => {
            const response = await contractHelper.getContracts(
     
            );
            return response;
        },
        
    });
};

export const useContract = (id: number) => {
    return useQuery<ContractResponseDto, Error>({
        queryKey: ['contract', id],
        queryFn: async () => {
            const response = await contractHelper.getContractById(id);
            return response;
        },
        enabled: !!id,
    });
};

export const useCreateContract = () => {
    const queryClient = useQueryClient();

    return useMutation<ContractResponseDto, Error, CreateContractDto>({
        mutationFn: async (dto: CreateContractDto) => {
            const response = await contractHelper.createContract(dto);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contracts'] });
        },
    });
};

export const useUpdateContract = () => {
    const queryClient = useQueryClient();

    return useMutation<
        ContractResponseDto,
        Error,
        { id: number; dto: UpdateContractDto }
    >({
        mutationFn: async ({ id, dto }) => {
            const response = await contractHelper.updateContract(id, dto);
            return response;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['contracts'] });
            queryClient.invalidateQueries({
                queryKey: ['contract', variables.id],
            });
        },
    });
};

export const useDeleteContract = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, number>({
        mutationFn: async (id: number) => {
            await contractHelper.deleteContract(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contracts'] });
        },
    });
};

