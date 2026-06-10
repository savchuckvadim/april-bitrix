'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    SmartResponseDto,
    CreateSmartDto,
    UpdateSmartDto
} from '@workspace/nest-api';
import { SmartHelper } from '../api/smarts-helper';
import { BTX_SMARTS_QUERY_KEY } from '../../constantas/btx-smarts.consts';

const smartHelper = new SmartHelper();

export const useSmarts = (portalId?: number) => {
    const params = portalId ? { portal_id: portalId.toString() } : undefined;
    debugger
    return useQuery<SmartResponseDto[], Error>({
        queryKey: [BTX_SMARTS_QUERY_KEY, params],
        queryFn: async () => {
            const response = await smartHelper.getSmarts(
                params || { portal_id: '' },
            );
            return response;
        },
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
            queryClient.invalidateQueries({ queryKey: [BTX_SMARTS_QUERY_KEY] });
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
            queryClient.invalidateQueries({ queryKey: [BTX_SMARTS_QUERY_KEY] });
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
            queryClient.invalidateQueries({ queryKey: [BTX_SMARTS_QUERY_KEY] });
        },
    });
};

