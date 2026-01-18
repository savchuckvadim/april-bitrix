'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    BtxRpaGetAllRpasParams,
    BtxRpaResponseDto,
    CreateBtxRpaDto,
    UpdateBtxRpaDto
} from '@workspace/nest-api';
import { BtxRpaHelper } from '../api/btxRpas-helper';

const btxRpaHelper = new BtxRpaHelper();

export const useBtxRpas = (params?:BtxRpaGetAllRpasParams) => {
    return useQuery<BtxRpaResponseDto[], Error>({
        queryKey: ['btxRpas', params],
        queryFn: async () => {
            const response = await btxRpaHelper.getBtxRpas(
                params || ({} as Partial<BtxRpaGetAllRpasParams>) as BtxRpaGetAllRpasParams,
            );
            return response;
        },
        enabled: !!params,
    });
};

export const useBtxRpa = (id: number) => {
    return useQuery<BtxRpaResponseDto, Error>({
        queryKey: ['btxRpa', id],
        queryFn: async () => {
            const response = await btxRpaHelper.getBtxRpaById(id);
            return response;
        },
        enabled: !!id,
    });
};

export const useCreateBtxRpa = () => {
    const queryClient = useQueryClient();

    return useMutation<BtxRpaResponseDto, Error, CreateBtxRpaDto>({
        mutationFn: async (dto: CreateBtxRpaDto) => {
            const response = await btxRpaHelper.createBtxRpa(dto);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['btxRpas'] });
        },
    });
};

export const useUpdateBtxRpa = () => {
    const queryClient = useQueryClient();

    return useMutation<
        BtxRpaResponseDto,
        Error,
        { id: number; dto: UpdateBtxRpaDto }
    >({
        mutationFn: async ({ id, dto }) => {
            const response = await btxRpaHelper.updateBtxRpa(id, dto);
            return response;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['btxRpas'] });
            queryClient.invalidateQueries({
                queryKey: ['btxRpa', variables.id],
            });
        },
    });
};

export const useDeleteBtxRpa = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, number>({
        mutationFn: async (id: number) => {
            await btxRpaHelper.deleteBtxRpa(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['btxRpas'] });
        },
    });
};

