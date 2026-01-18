'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    AdminPortalGetAllPortalsParams,
    PortalResponseDto,
    CreatePortalDto,
    UpdatePortalDto
} from '@workspace/nest-api';
import { PortalHelper } from '../api/portal-helper';

const portalHelper = new PortalHelper();

export const usePortals = (params?: AdminPortalGetAllPortalsParams) => {
    return useQuery<PortalResponseDto[], Error>({
        queryKey: ['portals', params],
        queryFn: async () => {
            const response = await portalHelper.getPortals(
                params || ({} as Partial<AdminPortalGetAllPortalsParams>) as AdminPortalGetAllPortalsParams,
            );
            return response;
        },
        enabled: !!params,
    });
};

export const usePortal = (id: number) => {
    return useQuery<PortalResponseDto, Error>({
        queryKey: ['portal', id],
        queryFn: async () => {
            const response = await portalHelper.getPortalById(id);
            return response;
        },
        enabled: !!id,
    });
};

export const useCreatePortal = () => {
    const queryClient = useQueryClient();

    return useMutation<PortalResponseDto, Error, CreatePortalDto>({
        mutationFn: async (dto: CreatePortalDto) => {
            const response = await portalHelper.createPortal(dto);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portals'] });
        },
    });
};

export const useUpdatePortal = () => {
    const queryClient = useQueryClient();

    return useMutation<
        PortalResponseDto,
        Error,
        { id: number; dto: UpdatePortalDto }
    >({
        mutationFn: async ({ id, dto }) => {
            const response = await portalHelper.updatePortal(id, dto);
            return response;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['portals'] });
            queryClient.invalidateQueries({
                queryKey: ['portal', variables.id],
            });
        },
    });
};

export const useDeletePortal = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, number>({
        mutationFn: async (id: number) => {
            await portalHelper.deletePortal(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portals'] });
        },
    });
};

