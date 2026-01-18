'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    BitrixFieldGetAllFieldsParams,
    BitrixFieldResponseDto,
    CreateBitrixFieldDto,
    CreateBitrixFieldsBulkDto,
    UpdateBitrixFieldDto
} from '@workspace/nest-api';
import { BitrixFieldHelper } from '../api/bitrixFields-helper';

const bitrixFieldHelper = new BitrixFieldHelper();

export const useBitrixFields = (params?: BitrixFieldGetAllFieldsParams) => {
    return useQuery<BitrixFieldResponseDto[], Error>({
        queryKey: ['bitrixFields', params],
        queryFn: async () => {
            const response = await bitrixFieldHelper.getBitrixFields(
                params || ({} as Partial<BitrixFieldGetAllFieldsParams>) as BitrixFieldGetAllFieldsParams,
            );
            return response;
        },
        enabled: !!params,
    });
};

export const useBitrixField = (id: number) => {
    return useQuery<BitrixFieldResponseDto, Error>({
        queryKey: ['bitrixField', id],
        queryFn: async () => {
            const response = await bitrixFieldHelper.getBitrixFieldById(id);
            return response;
        },
        enabled: !!id,
    });
};

export const useCreateBitrixField = () => {
    const queryClient = useQueryClient();

    return useMutation<BitrixFieldResponseDto, Error, CreateBitrixFieldDto>({
        mutationFn: async (dto: CreateBitrixFieldDto) => {
            const response = await bitrixFieldHelper.createBitrixField(dto);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bitrixFields'] });
        },
    });
};

export const useUpdateBitrixField = () => {
    const queryClient = useQueryClient();

    return useMutation<
        BitrixFieldResponseDto,
        Error,
        { id: number; dto: UpdateBitrixFieldDto }
    >({
        mutationFn: async ({ id, dto }) => {
            const response = await bitrixFieldHelper.updateBitrixField(id, dto);
            return response;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['bitrixFields'] });
            queryClient.invalidateQueries({
                queryKey: ['bitrixField', variables.id],
            });
        },
    });
};

export const useDeleteBitrixField = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, number>({
        mutationFn: async (id: number) => {
            await bitrixFieldHelper.deleteBitrixField(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bitrixFields'] });
        },
    });
};

