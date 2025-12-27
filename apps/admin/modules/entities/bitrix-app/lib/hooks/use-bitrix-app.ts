'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    AdminBitrixAppGetAppParams,
    CreateBitrixAppDto,
    UpdateBitrixAppDto,
} from '@workspace/nest-api';
import { BitrixAppHelper } from '../api/bitrix-app-helper';

const bitrixAppHelper = new BitrixAppHelper();

export const useBitrixApps = () => {
    return useQuery<any[], Error>({
        queryKey: ['bitrix-apps'],
        queryFn: async () => {
            const response = await bitrixAppHelper.getAllApps();
            return response;
        },
    });
};

export const useBitrixApp = (params: AdminBitrixAppGetAppParams) => {
    return useQuery<any, Error>({
        queryKey: ['bitrix-app', params],
        queryFn: async () => {
            const response = await bitrixAppHelper.getApp(params);
            return response;
        },
        enabled: !!params.domain && !!params.code,
    });
};

export const useBitrixAppsByPortal = (domain: string) => {
    return useQuery<any[], Error>({
        queryKey: ['bitrix-apps', 'portal', domain],
        queryFn: async () => {
            const response = await bitrixAppHelper.getAppsByPortal(domain);
            return response;
        },
        enabled: !!domain,
    });
};

export const useBitrixAppsByPortalId = (portalId: number) => {
    return useQuery<any[], Error>({
        queryKey: ['bitrix-apps', 'portal-id', portalId],
        queryFn: async () => {
            const response =
                await bitrixAppHelper.getAppsByPortalId(portalId);
            return response;
        },
        enabled: !!portalId,
    });
};

export const useEnabledBitrixApps = () => {
    return useQuery<any[], Error>({
        queryKey: ['bitrix-apps', 'enabled'],
        queryFn: async () => {
            const response = await bitrixAppHelper.getEnabledApps();
            return response;
        },
    });
};

export const useStoreOrUpdateBitrixApp = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, CreateBitrixAppDto>({
        mutationFn: async (dto: CreateBitrixAppDto) => {
            await bitrixAppHelper.storeOrUpdateApp(dto);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bitrix-apps'] });
        },
    });
};

export const useUpdateBitrixApp = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, { id: number; dto: UpdateBitrixAppDto }>({
        mutationFn: async ({ id, dto }) => {
            await bitrixAppHelper.updateApp(id, dto);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bitrix-apps'] });
        },
    });
};

export const useDeleteBitrixApp = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, string>({
        mutationFn: async (id: string) => {
            await bitrixAppHelper.deleteApp(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bitrix-apps'] });
        },
    });
};

