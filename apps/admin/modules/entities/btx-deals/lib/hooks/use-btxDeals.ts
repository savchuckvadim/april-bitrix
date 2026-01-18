'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    BtxDealGetAllDealsParams,
    BtxDealResponseDto,
    CreateBtxDealDto,
    UpdateBtxDealDto
} from '@workspace/nest-api';
import { BtxDealHelper } from '../api/btxDeals-helper';

const btxDealHelper = new BtxDealHelper();

export const useBtxDeals = (params?: BtxDealGetAllDealsParams) => {
    return useQuery<BtxDealResponseDto[], Error>({
        queryKey: ['btxDeals', params],
        queryFn: async () => {
            const response = await btxDealHelper.getBtxDeals(
                params || ({} as Partial<BtxDealGetAllDealsParams>) as BtxDealGetAllDealsParams,
            );
            return response;
        },
        enabled: !!params,
    });
};

export const useBtxDeal = (id: number) => {
    return useQuery<BtxDealResponseDto, Error>({
        queryKey: ['btxDeal', id],
        queryFn: async () => {
            const response = await btxDealHelper.getBtxDealById(id);
            return response;
        },
        enabled: !!id,
    });
};

export const useCreateBtxDeal = () => {
    const queryClient = useQueryClient();

    return useMutation<BtxDealResponseDto, Error, CreateBtxDealDto>({
        mutationFn: async (dto: CreateBtxDealDto) => {
            const response = await btxDealHelper.createBtxDeal(dto);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['btxDeals'] });
        },
    });
};

export const useUpdateBtxDeal = () => {
    const queryClient = useQueryClient();

    return useMutation<
        BtxDealResponseDto,
        Error,
        { id: number; dto: UpdateBtxDealDto }
    >({
        mutationFn: async ({ id, dto }) => {
            const response = await btxDealHelper.updateBtxDeal(id, dto);
            return response;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['btxDeals'] });
            queryClient.invalidateQueries({
                queryKey: ['btxDeal', variables.id],
            });
        },
    });
};

export const useDeleteBtxDeal = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, number>({
        mutationFn: async (id: number) => {
            await btxDealHelper.deleteBtxDeal(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['btxDeals'] });
        },
    });
};

