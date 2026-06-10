'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    PortalResponseDto,
    CreatePortalDto,
} from '../model';

import { PortalHelper } from '../api/portal-helper';

const portalHelper = new PortalHelper();


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


