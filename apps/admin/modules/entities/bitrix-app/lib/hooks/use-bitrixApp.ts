'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    AdminBitrixAppGetAppParams,

    BitrixAppDto,

    CreateBitrixAppDto,
    UpdateBitrixAppDto
} from '@workspace/nest-api';
import { BitrixAppHelper } from '../api/bitrixApp-helper';

const bitrixAppHelper = new BitrixAppHelper();

export const useBitrixApps = (params?: AdminBitrixAppGetAppParams) => {
    return useQuery<BitrixAppDto[], Error>({
        queryKey: ['bitrixApps', params],
        queryFn: async () => {
            const response = await bitrixAppHelper.getBitrixApps();
            return response;
        },
        enabled: !!params,
    });
};

export const useBitrixApp = (params?: AdminBitrixAppGetAppParams) => {
    return useQuery<BitrixAppDto, Error>({
        queryKey: ['bitrixApp', params],
        queryFn: async () => {
            const response = await bitrixAppHelper.getBitrixAppById(params || {} as AdminBitrixAppGetAppParams);
            return response;
        },
        enabled: !!params,
    });
};

export const useCreateBitrixApp = () => {
    const queryClient = useQueryClient();

    return useMutation<BitrixAppDto, Error, CreateBitrixAppDto>({
        mutationFn: async (dto: CreateBitrixAppDto) => {
            const response = await bitrixAppHelper.createBitrixApp(dto);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bitrixApps'] });
        },
    });
};

export const useUpdateBitrixApp = () => {
    const queryClient = useQueryClient();

    return useMutation<
        BitrixAppDto,
        Error,
        { id: number; dto: UpdateBitrixAppDto }
    >({
        mutationFn: async ({ id, dto }) => {
            const response = await bitrixAppHelper.updateBitrixApp(id, dto);
            return response;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['bitrixApps'] });
            queryClient.invalidateQueries({
                queryKey: ['bitrixApp', variables.id],
            });
        },
    });
};

export const useDeleteBitrixApp = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, number>({
        mutationFn: async (id: number) => {
            await bitrixAppHelper.deleteBitrixApp(id.toString());
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bitrixApps'] });
        },
    });
};

