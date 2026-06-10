'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    InfogroupResponseDto,
    InfogroupCreateDto,
} from '../../model';
import { InfoGroupsHelper } from '../api/info-groups-helper';

const helper = new InfoGroupsHelper();

export const useInfoGroups = () => {
    return useQuery<InfogroupResponseDto[], Error>({
        queryKey: ['info-groups'],
        queryFn: async () => {
            const response = await helper.list();
            return response;
        },
    });
};

export const useInfoGroup = (id: string) => {
    return useQuery<InfogroupResponseDto, Error>({
        queryKey: ['info-group', id],
        queryFn: async () => {
            const response = await helper.get(id);
            return response;
        },
        enabled: !!id,
    });
};

export const useCreateInfoGroup = () => {
    const queryClient = useQueryClient();

    return useMutation<InfogroupResponseDto, Error, InfogroupCreateDto>({
        mutationFn: async (dto: InfogroupCreateDto) => {
            const response = await helper.create(dto);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['info-groups'] });
        },
    });
};

export const useUpdateInfoGroup = () => {
    const queryClient = useQueryClient();

    return useMutation<
        InfogroupResponseDto,
        Error,
        { id: string; dto: InfogroupCreateDto }
    >({
        mutationFn: async ({ id, dto }) => {
            const response = await helper.update(id, dto);
            return response;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['info-groups'] });
            queryClient.invalidateQueries({
                queryKey: ['info-group', variables.id],
            });
        },
    });
};
