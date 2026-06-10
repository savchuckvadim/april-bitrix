'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    TimezoneGetAllTimezonesParams,
    TimezoneResponseDto,
    CreateTimezoneDto,
    UpdateTimezoneDto
} from '@workspace/nest-api';
import { TimezoneHelper } from '../api/timezones-helper';

const timezoneHelper = new TimezoneHelper();

export const useTimezones = (params?: TimezoneGetAllTimezonesParams) => {
    return useQuery<TimezoneResponseDto[], Error>({
        queryKey: ['timezones', params],
        queryFn: async () => {
            const response = await timezoneHelper.getTimezones(
                params || ({} as Partial<TimezoneGetAllTimezonesParams>) as TimezoneGetAllTimezonesParams,
            );
            return response;
        },
        enabled: !!params,
    });
};

export const useTimezone = (id: number) => {
    return useQuery<TimezoneResponseDto, Error>({
        queryKey: ['timezone', id],
        queryFn: async () => {
            const response = await timezoneHelper.getTimezoneById(id);
            return response;
        },
        enabled: !!id,
    });
};

export const useCreateTimezone = () => {
    const queryClient = useQueryClient();

    return useMutation<TimezoneResponseDto, Error, CreateTimezoneDto>({
        mutationFn: async (dto: CreateTimezoneDto) => {
            const response = await timezoneHelper.createTimezone(dto);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['timezones'] });
        },
    });
};

export const useUpdateTimezone = () => {
    const queryClient = useQueryClient();

    return useMutation<
        TimezoneResponseDto,
        Error,
        { id: number; dto: UpdateTimezoneDto }
    >({
        mutationFn: async ({ id, dto }) => {
            const response = await timezoneHelper.updateTimezone(id, dto);
            return response;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['timezones'] });
            queryClient.invalidateQueries({
                queryKey: ['timezone', variables.id],
            });
        },
    });
};

export const useDeleteTimezone = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, number>({
        mutationFn: async (id: number) => {
            await timezoneHelper.deleteTimezone(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['timezones'] });
        },
    });
};

