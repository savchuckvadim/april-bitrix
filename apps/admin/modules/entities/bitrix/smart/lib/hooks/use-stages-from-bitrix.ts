'use client';

import { useQuery } from '@tanstack/react-query';
import { useBitrixClient } from '@/modules/entities/bitrix/bitrix-client';
import { useCurrentPortal } from '@/modules/entities/portal';
import { BitrixSmartHelper } from '../api/bitrix-smart.helper';
import type { BxSmartStage } from '../../model/types';

export const BX_STAGES_QUERY_KEY = 'bx-stages-live';

/**
 * Fetches stages for a specific Bitrix category.
 * Enabled only when both entityTypeId and categoryId are provided.
 */
export function useStagesFromBitrix(
    entityTypeId: number | string | undefined,
    categoryId: number | string | undefined,
) {
    const portal = useCurrentPortal();
    const { client, isLoading: clientLoading } = useBitrixClient();

    const query = useQuery<BxSmartStage[], Error>({
        queryKey: [BX_STAGES_QUERY_KEY, portal?.id, entityTypeId, categoryId],
        queryFn: async () => {
            if (!client) throw new Error('Bitrix client not ready');
            if (!entityTypeId || !categoryId) return [];
            const helper = new BitrixSmartHelper(client);
            return helper.getStagesForCategory(entityTypeId, categoryId);
        },
        enabled: !!client && !!portal?.id && !!entityTypeId && !!categoryId,
        staleTime: 60_000,
    });

    return {
        stages: Array.isArray(query.data) ? query.data : [],
        isLoading: clientLoading || query.isLoading,
        isError: query.isError,
        refetch: query.refetch,
    };
}
