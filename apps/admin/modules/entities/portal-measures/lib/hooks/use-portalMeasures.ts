'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    PortalMeasureGetAllPortalMeasuresParams,
    PortalMeasureResponseDto,
    CreatePortalMeasureDto,
    UpdatePortalMeasureDto
} from '@workspace/nest-api';
import { PortalMeasureHelper } from '../api/portalMeasures-helper';

const portalMeasureHelper = new PortalMeasureHelper();

export const usePortalMeasures = (params?: PortalMeasureGetAllPortalMeasuresParams) => {
    return useQuery<PortalMeasureResponseDto[], Error>({
        queryKey: ['portalMeasures', params],
        queryFn: async () => {
            const response = await portalMeasureHelper.getPortalMeasures(
                params || ({} as Partial<PortalMeasureGetAllPortalMeasuresParams>) as PortalMeasureGetAllPortalMeasuresParams,
            );
            return response;
        },
        enabled: !!params,
    });
};

export const usePortalMeasure = (id: number) => {
    return useQuery<PortalMeasureResponseDto, Error>({
        queryKey: ['portalMeasure', id],
        queryFn: async () => {
            const response = await portalMeasureHelper.getPortalMeasureById(id);
            return response;
        },
        enabled: !!id,
    });
};

export const useCreatePortalMeasure = () => {
    const queryClient = useQueryClient();

    return useMutation<PortalMeasureResponseDto, Error, CreatePortalMeasureDto>({
        mutationFn: async (dto: CreatePortalMeasureDto) => {
            const response = await portalMeasureHelper.createPortalMeasure(dto);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portalMeasures'] });
        },
    });
};

export const useUpdatePortalMeasure = () => {
    const queryClient = useQueryClient();

    return useMutation<
        PortalMeasureResponseDto,
        Error,
        { id: number; dto: UpdatePortalMeasureDto }
    >({
        mutationFn: async ({ id, dto }) => {
            const response = await portalMeasureHelper.updatePortalMeasure(id, dto);
            return response;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['portalMeasures'] });
            queryClient.invalidateQueries({
                queryKey: ['portalMeasure', variables.id],
            });
        },
    });
};

export const useDeletePortalMeasure = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, number>({
        mutationFn: async (id: number) => {
            await portalMeasureHelper.deletePortalMeasure(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portalMeasures'] });
        },
    });
};

