'use client';

import { useMutation,  useQueryClient } from '@tanstack/react-query';
import {

    PortalResponseDto,
    UpdatePortalDto
} from '../model';
import { PortalHelper } from '../api/portal-helper';

const portalHelper = new PortalHelper();

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
