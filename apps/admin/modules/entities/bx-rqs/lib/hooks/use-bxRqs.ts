'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    BxRqGetAllRqsParams,
    BxRqResponseDto,
    CreateBxRqDto,
    UpdateBxRqDto
} from '@workspace/nest-api';
import { BxRqHelper } from '../api/bxRqs-helper';

const bxRqHelper = new BxRqHelper();

export const useBxRqs = (params?: BxRqGetAllRqsParams) => {
    return useQuery<BxRqResponseDto[], Error>({
        queryKey: ['bxRqs', params],
        queryFn: async () => {
            const response = await bxRqHelper.getBxRqs(
                params || ({} as Partial<BxRqGetAllRqsParams>) as BxRqGetAllRqsParams,
            );
            return response;
        },
        enabled: !!params,
    });
};

export const useBxRq = (id: number) => {
    return useQuery<BxRqResponseDto, Error>({
        queryKey: ['bxRq', id],
        queryFn: async () => {
            const response = await bxRqHelper.getBxRqById(id);
            return response;
        },
        enabled: !!id,
    });
};

export const useCreateBxRq = () => {
    const queryClient = useQueryClient();

    return useMutation<BxRqResponseDto, Error, CreateBxRqDto>({
        mutationFn: async (dto: CreateBxRqDto) => {
            const response = await bxRqHelper.createBxRq(dto);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bxRqs'] });
        },
    });
};

export const useUpdateBxRq = () => {
    const queryClient = useQueryClient();

    return useMutation<
        BxRqResponseDto,
        Error,
        { id: number; dto: UpdateBxRqDto }
    >({
        mutationFn: async ({ id, dto }) => {
            const response = await bxRqHelper.updateBxRq(id, dto);
            return response;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['bxRqs'] });
            queryClient.invalidateQueries({
                queryKey: ['bxRq', variables.id],
            });
        },
    });
};

export const useDeleteBxRq = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, number>({
        mutationFn: async (id: number) => {
            await bxRqHelper.deleteBxRq(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bxRqs'] });
        },
    });
};

