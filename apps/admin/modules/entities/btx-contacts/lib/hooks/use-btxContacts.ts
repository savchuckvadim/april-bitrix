'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    BtxContactGetAllContactsParams,
    BtxContactResponseDto,
    CreateBtxContactDto,
    UpdateBtxContactDto
} from '@workspace/nest-api';
import { BtxContactHelper } from '../api/btxContacts-helper';

const btxContactHelper = new BtxContactHelper();

export const useBtxContacts = (params?: BtxContactGetAllContactsParams) => {
    return useQuery<BtxContactResponseDto[], Error>({
        queryKey: ['btxContacts', params],
        queryFn: async () => {
            const response = await btxContactHelper.getBtxContacts(
                params || ({} as Partial<BtxContactGetAllContactsParams>) as BtxContactGetAllContactsParams,
            );
            return response;
        },
        enabled: !!params,
    });
};

export const useBtxContact = (id: number) => {
    return useQuery<BtxContactResponseDto, Error>({
        queryKey: ['btxContact', id],
        queryFn: async () => {
            const response = await btxContactHelper.getBtxContactById(id);
            return response;
        },
        enabled: !!id,
    });
};

export const useCreateBtxContact = () => {
    const queryClient = useQueryClient();

    return useMutation<BtxContactResponseDto, Error, CreateBtxContactDto>({
        mutationFn: async (dto: CreateBtxContactDto) => {
            const response = await btxContactHelper.createBtxContact(dto);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['btxContacts'] });
        },
    });
};

export const useUpdateBtxContact = () => {
    const queryClient = useQueryClient();

    return useMutation<
        BtxContactResponseDto,
        Error,
        { id: number; dto: UpdateBtxContactDto }
    >({
        mutationFn: async ({ id, dto }) => {
            const response = await btxContactHelper.updateBtxContact(id, dto);
            return response;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['btxContacts'] });
            queryClient.invalidateQueries({
                queryKey: ['btxContact', variables.id],
            });
        },
    });
};

export const useDeleteBtxContact = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, number>({
        mutationFn: async (id: number) => {
            await btxContactHelper.deleteBtxContact(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['btxContacts'] });
        },
    });
};

