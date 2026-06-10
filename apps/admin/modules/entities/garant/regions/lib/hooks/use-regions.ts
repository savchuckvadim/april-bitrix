'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    MeasureResponseDto,
    CreateMeasureDto,
    UpdateMeasureDto,
    GetRegionResponseDto,
    CreateRegionDto
} from '@workspace/nest-api';
import { RegionsHelper } from '../api/regions-helper';

const helper = new RegionsHelper();

export const useRegions = () => {
    return useQuery<GetRegionResponseDto[], Error>({
        queryKey: ['regions'],
        queryFn: async () => {
            const response = await helper.list();

            return response;
        },

    });
};

export const useRegion = (id: number) => {
    return useQuery<GetRegionResponseDto, Error>({
        queryKey: ['region', id],
        queryFn: async () => {
            const response = await helper.get(id);
            return response;
        },
        enabled: !!id,
    });
};

export const useCreateRegion = () => {
    const queryClient = useQueryClient();

    return useMutation<GetRegionResponseDto, Error, CreateRegionDto>({
        mutationFn: async (dto: CreateRegionDto) => {
            const response = await helper.create(dto);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['regions'] });
        },
    });
};

export const useUpdateRegion = () => {
    const queryClient = useQueryClient();

    return useMutation<
        GetRegionResponseDto,
        Error,
        { id: number; dto: CreateRegionDto }
    >({
        mutationFn: async ({ id, dto }) => {
            const response = await helper.update(id, dto);
            return response;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['regions'] });
            queryClient.invalidateQueries({
                queryKey: ['region', variables.id],
            });
        },
    });
};

export const useDeleteRegion = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, number>({
        mutationFn: async (id: number) => {
            await helper.delete(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['regions'] });
        },
    });
};

