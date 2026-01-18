'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    BtxLeadGetAllLeadsParams,
    BtxLeadResponseDto,
    CreateBtxLeadDto,
    UpdateBtxLeadDto
} from '@workspace/nest-api';
import { BtxLeadHelper } from '../api/btxLeads-helper';

const btxLeadHelper = new BtxLeadHelper();

export const useBtxLeads = (params?:BtxLeadGetAllLeadsParams) => {
    return useQuery<BtxLeadResponseDto[], Error>({
        queryKey: ['btxLeads', params],
        queryFn: async () => {
            const response = await btxLeadHelper.getBtxLeads(
                params || ({} as Partial<BtxLeadGetAllLeadsParams>) as BtxLeadGetAllLeadsParams,
            );
            return response;
        },
        enabled: !!params,
    });
};

export const useBtxLead = (id: number) => {
    return useQuery<BtxLeadResponseDto, Error>({
        queryKey: ['btxLead', id],
        queryFn: async () => {
            const response = await btxLeadHelper.getBtxLeadById(id);
            return response;
        },
        enabled: !!id,
    });
};

export const useCreateBtxLead = () => {
    const queryClient = useQueryClient();

    return useMutation<BtxLeadResponseDto, Error, CreateBtxLeadDto>({
        mutationFn: async (dto: CreateBtxLeadDto) => {
            const response = await btxLeadHelper.createBtxLead(dto);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['btxLeads'] });
        },
    });
};

export const useUpdateBtxLead = () => {
    const queryClient = useQueryClient();

    return useMutation<
        BtxLeadResponseDto,
        Error,
        { id: number; dto: UpdateBtxLeadDto }
    >({
        mutationFn: async ({ id, dto }) => {
            const response = await btxLeadHelper.updateBtxLead(id, dto);
            return response;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['btxLeads'] });
            queryClient.invalidateQueries({
                queryKey: ['btxLead', variables.id],
            });
        },
    });
};

export const useDeleteBtxLead = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, number>({
        mutationFn: async (id: number) => {
            await btxLeadHelper.deleteBtxLead(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['btxLeads'] });
        },
    });
};

