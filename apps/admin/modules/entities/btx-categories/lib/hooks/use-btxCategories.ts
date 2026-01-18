'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    BtxCategoryGetAllCategoriesParams,
    BtxCategoryResponseDto,
    CreateBtxCategoryDto,
    UpdateBtxCategoryDto
} from '@workspace/nest-api';
import { BtxCategorieHelper } from '../api/btxCategories-helper';

const btxCategorieHelper = new BtxCategorieHelper();

export const useBtxCategories = (params?: BtxCategoryGetAllCategoriesParams) => {
    return useQuery<BtxCategoryResponseDto[], Error>({
        queryKey: ['btxCategories', params],
        queryFn: async () => {
            const response = await btxCategorieHelper.getBtxCategories(
                params,
            );
            return response;
        },
        enabled: !!params,
    });
};

export const useBtxCategorie = (id: number) => {
    return useQuery<BtxCategoryResponseDto, Error>({
        queryKey: ['btxCategorie', id],
        queryFn: async () => {
            const response = await btxCategorieHelper.getBtxCategorieById(id);
            return response;
        },
        enabled: !!id,
    });
};

export const useCreateBtxCategorie = () => {
    const queryClient = useQueryClient();

    return useMutation<BtxCategoryResponseDto, Error, CreateBtxCategoryDto>({
        mutationFn: async (dto: CreateBtxCategoryDto) => {
            const response = await btxCategorieHelper.createBtxCategorie(dto);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['btxCategories'] });
        },
    });
};

export const useUpdateBtxCategorie = () => {
    const queryClient = useQueryClient();

    return useMutation<
        BtxCategoryResponseDto,
        Error,
        { id: number; dto: UpdateBtxCategoryDto }
    >({
        mutationFn: async ({ id, dto }) => {
            const response = await btxCategorieHelper.updateBtxCategorie(id, dto);
            return response;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['btxCategories'] });
            queryClient.invalidateQueries({
                queryKey: ['btxCategorie', variables.id],
            });
        },
    });
};

export const useDeleteBtxCategorie = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, number>({
        mutationFn: async (id: number) => {
            await btxCategorieHelper.deleteBtxCategorie(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['btxCategories'] });
        },
    });
};

