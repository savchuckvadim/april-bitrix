'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    GetSupplyResponseDto,
    CreateSupplyDto,
} from '@workspace/nest-admin-api';
import { SuppliesHelper } from '../api/supplies-helper';

const helper = new SuppliesHelper();

export const useSupplies = () => {
    return useQuery<GetSupplyResponseDto[], Error>({
        queryKey: ['supplies'],
        queryFn: async () => {
            const response = await helper.list();
            return response;
        },
    });
};

export const useSupply = (id: string) => {
    return useQuery<GetSupplyResponseDto, Error>({
        queryKey: ['supply', id],
        queryFn: async () => {
            const response = await helper.get(id);
            return response;
        },
        enabled: !!id,
    });
};

export const useCreateSupply = () => {
    const queryClient = useQueryClient();

    return useMutation<GetSupplyResponseDto, Error, CreateSupplyDto>({
        mutationFn: async (dto: CreateSupplyDto) => {
            const response = await helper.create(dto);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['supplies'] });
        },
    });
};

export const useUpdateSupply = () => {
    const queryClient = useQueryClient();

    return useMutation<
        GetSupplyResponseDto,
        Error,
        { id: string; dto: CreateSupplyDto }
    >({
        mutationFn: async ({ id, dto }) => {
            const response = await helper.update(id, dto);
            return response;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['supplies'] });
            queryClient.invalidateQueries({
                queryKey: ['supply', variables.id],
            });
        },
    });
};
