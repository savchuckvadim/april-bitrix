'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    BtxCompanyGetAllCompaniesParams,
    BtxCompanyResponseDto,
    CreateBtxCompanyDto,
    UpdateBtxCompanyDto
} from '@workspace/nest-api';
import { BtxCompanieHelper } from '../api/btxCompanies-helper';

const btxCompanieHelper = new BtxCompanieHelper();

export const useBtxCompanies = (params?: BtxCompanyGetAllCompaniesParams) => {
    return useQuery<BtxCompanyResponseDto[], Error>({
        queryKey: ['btxCompanies', params],
        queryFn: async () => {
            const response = await btxCompanieHelper.getBtxCompanies(
                params || {} as BtxCompanyGetAllCompaniesParams,
            );
            return response;
        },
        enabled: !!params,
    });
};

export const useBtxCompanie = (id: number) => {
    return useQuery<BtxCompanyResponseDto, Error>({
        queryKey: ['btxCompanie', id],
        queryFn: async () => {
            const response = await btxCompanieHelper.getBtxCompanieById(id);
            return response;
        },
        enabled: !!id,
    });
};

export const useCreateBtxCompanie = () => {
    const queryClient = useQueryClient();

    return useMutation<BtxCompanyResponseDto, Error, CreateBtxCompanyDto>({
        mutationFn: async (dto: CreateBtxCompanyDto) => {
            const response = await btxCompanieHelper.createBtxCompanie(dto);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['btxCompanies'] });
        },
    });
};

export const useUpdateBtxCompanie = () => {
    const queryClient = useQueryClient();

    return useMutation<
        BtxCompanyResponseDto,
        Error,
        { id: number; dto: UpdateBtxCompanyDto }
    >({
        mutationFn: async ({ id, dto }) => {
            const response = await btxCompanieHelper.updateBtxCompanie(id, dto);
            return response;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['btxCompanies'] });
            queryClient.invalidateQueries({
                queryKey: ['btxCompanie', variables.id],
            });
        },
    });
};

export const useDeleteBtxCompanie = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, number>({
        mutationFn: async (id: number) => {
            await btxCompanieHelper.deleteBtxCompanie(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['btxCompanies'] });
        },
    });
};

