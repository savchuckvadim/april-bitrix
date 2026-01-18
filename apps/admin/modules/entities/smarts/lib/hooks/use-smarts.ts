'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    SmartGetAllSmartsParams,
    SmartResponseDto,
    CreateSmartDto,
    UpdateSmartDto
} from '@workspace/nest-api';
import { SmartHelper } from '../api/smarts-helper';

const smartHelper = new SmartHelper();

export const useSmarts = (params?: SmartGetAllSmartsParams) => {
    return useQuery<SmartResponseDto[], Error>({
        queryKey: ['smarts', params],
        queryFn: async () => {
            const response = await smartHelper.getSmarts(
                params || ({} as Partial<SmartGetAllSmartsParams>) as SmartGetAllSmartsParams,
            );
            return response;
        },
        enabled: !!params,
    });
};

export const useSmart = (id: number) => {
    return useQuery<SmartResponseDto, Error>({
        queryKey: ['smart', id],
        queryFn: async () => {
            const response = await smartHelper.getSmartById(id);
            return response;
        },
        enabled: !!id,
    });
};

export const useCreateSmart = () => {
    const queryClient = useQueryClient();

    return useMutation<SmartResponseDto, Error, CreateSmartDto>({
        mutationFn: async (dto: CreateSmartDto) => {
            const response = await smartHelper.createSmart(dto);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['smarts'] });
        },
    });
};

export const useUpdateSmart = () => {
    const queryClient = useQueryClient();

    return useMutation<
        SmartResponseDto,
        Error,
        { id: number; dto: UpdateSmartDto }
    >({
        mutationFn: async ({ id, dto }) => {
            const response = await smartHelper.updateSmart(id, dto);
            return response;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['smarts'] });
            queryClient.invalidateQueries({
                queryKey: ['smart', variables.id],
            });
        },
    });
};

export const useDeleteSmart = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, number>({
        mutationFn: async (id: number) => {
            await smartHelper.deleteSmart(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['smarts'] });
        },
    });
};

