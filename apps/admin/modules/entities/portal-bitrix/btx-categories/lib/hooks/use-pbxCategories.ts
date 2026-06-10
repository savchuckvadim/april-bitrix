'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    PbxCategory,
    PbxCreateCategoryDto,
    PbxGetCategoriesByEntityDto,
    PbxUpdateCategoryDto,
} from '../../model';
import { BtxCategorieHelper } from '../api/pbx-categories-helper';

const btxCategorieHelper = new BtxCategorieHelper();

export const useBtxCategories = (dto: PbxGetCategoriesByEntityDto) => {
   console.log('dto', dto);
   debugger
    return useQuery<PbxCategory[], Error>({
        queryKey: ['btxCategories', dto],
        queryFn: async () => {
            const response = await btxCategorieHelper.getBtxCategories(
                dto,
            );
            return response;
        },
        enabled: !!dto,
    });
};

export const useBtxCategorie = (id: number) => {
    return useQuery<PbxCategory, Error>({
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

    return useMutation<PbxCategory, Error, PbxCreateCategoryDto>({
        mutationFn: async (dto: PbxCreateCategoryDto) => {
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
        PbxCategory,
        Error,
        { id: number; dto: PbxUpdateCategoryDto }
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

