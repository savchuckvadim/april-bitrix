'use client';

import { useMutation,  useQueryClient } from '@tanstack/react-query';
import { PortalHelper } from '../api/portal-helper';
const portalHelper = new PortalHelper();

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

