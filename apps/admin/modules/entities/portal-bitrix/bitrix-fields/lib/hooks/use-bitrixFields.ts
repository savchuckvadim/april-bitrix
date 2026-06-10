'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    PbxCreateFieldDto,
    PbxCreateFieldsBulkDto,
    PbxField,
    PbxGetFieldsByEntityDto,
    PbxUpdateFieldDto,
} from '../../model';
import { BitrixFieldHelper } from '../api/bitrixFields-helper';

const bitrixFieldHelper = new BitrixFieldHelper();

export const useBitrixFields = (dto?: PbxGetFieldsByEntityDto) => {
    return useQuery<PbxField[], Error>({
        queryKey: ['bitrixFields', dto],
        queryFn: async () => {
            if (!dto) return [];
            const response = await bitrixFieldHelper.getBitrixFields(dto);
            return response;
        },
        enabled: !!dto,
    });
};

export const useBitrixField = (id: number) => {
    return useQuery<PbxField, Error>({
        queryKey: ['bitrixField', id],
        queryFn: async () => {
            const response = await bitrixFieldHelper.getBitrixFieldById(id);
            return response;
        },
        enabled: !!id,
    });
};

export const useCreateBitrixField = () => {
    const queryClient = useQueryClient();

    return useMutation<PbxField, Error, PbxCreateFieldDto>({
        mutationFn: async (dto: PbxCreateFieldDto) => {
            const response = await bitrixFieldHelper.createBitrixField(dto);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bitrixFields'] });
        },
    });
};

export const useCreateBitrixFieldsBulk = () => {
    const queryClient = useQueryClient();

    return useMutation<PbxField[], Error, PbxCreateFieldsBulkDto>({
        mutationFn: async (dto: PbxCreateFieldsBulkDto) => {
            const response = await bitrixFieldHelper.createBitrixFieldsBulk(dto);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bitrixFields'] });
        },
    });
};

export const useUpdateBitrixField = () => {
    const queryClient = useQueryClient();

    return useMutation<
        PbxField,
        Error,
        { id: number; dto: PbxUpdateFieldDto }
    >({
        mutationFn: async ({ id, dto }) => {
            const response = await bitrixFieldHelper.updateBitrixField(id, dto);
            return response;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['bitrixFields'] });
            queryClient.invalidateQueries({
                queryKey: ['bitrixField', variables.id],
            });
        },
    });
};

export const useDeleteBitrixField = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, number>({
        mutationFn: async (id: number) => {
            await bitrixFieldHelper.deleteBitrixField(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bitrixFields'] });
        },
    });
};

