'use client';

import { useQuery } from '@tanstack/react-query';
import {
    AdminPortalGetAllPortalsParams,
    PortalResponseDto,

} from '../model';
import { PortalHelper } from '../api/portal-helper';

const portalHelper = new PortalHelper();

export const usePortals = (params?: AdminPortalGetAllPortalsParams) => {
    return useQuery<PortalResponseDto[], Error>({
        queryKey: ['portals', params],
        queryFn: async () => {
            ;
            const response = await portalHelper.getPortals(
                params || ({} as Partial<AdminPortalGetAllPortalsParams>) as AdminPortalGetAllPortalsParams,
            );
            ;
            return response;
        },
        // enabled: true по умолчанию, запрос выполняется всегда
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
