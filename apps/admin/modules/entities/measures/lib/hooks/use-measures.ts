'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    MeasureResponseDto,
    CreateMeasureDto,
    UpdateMeasureDto
} from '@workspace/nest-api';
import { MeasureHelper } from '../api/measures-helper';

const measureHelper = new MeasureHelper();

export const useMeasures = () => {
    return useQuery<MeasureResponseDto[], Error>({
        queryKey: ['measures'],
        queryFn: async () => {
            const response = await measureHelper.getMeasures(

            );
            return response;
        },

    });
};

export const useMeasure = (id: number) => {
    return useQuery<MeasureResponseDto, Error>({
        queryKey: ['measure', id],
        queryFn: async () => {
            const response = await measureHelper.getMeasureById(id);
            return response;
        },
        enabled: !!id,
    });
};

export const useCreateMeasure = () => {
    const queryClient = useQueryClient();

    return useMutation<MeasureResponseDto, Error, CreateMeasureDto>({
        mutationFn: async (dto: CreateMeasureDto) => {
            const response = await measureHelper.createMeasure(dto);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['measures'] });
        },
    });
};

export const useUpdateMeasure = () => {
    const queryClient = useQueryClient();

    return useMutation<
        MeasureResponseDto,
        Error,
        { id: number; dto: UpdateMeasureDto }
    >({
        mutationFn: async ({ id, dto }) => {
            const response = await measureHelper.updateMeasure(id, dto);
            return response;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['measures'] });
            queryClient.invalidateQueries({
                queryKey: ['measure', variables.id],
            });
        },
    });
};

export const useDeleteMeasure = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, number>({
        mutationFn: async (id: number) => {
            await measureHelper.deleteMeasure(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['measures'] });
        },
    });
};

