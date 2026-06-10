'use client';

import { useQuery } from '@tanstack/react-query';
import { useBitrixClient } from '@/modules/entities/bitrix/bitrix-client';
import { useCurrentPortal } from '@/modules/entities/portal';
import { BitrixSmartHelper } from '../api/bitrix-smart.helper';
import type { BxSmartFullType } from '../../model/types';

export const BX_SMARTS_QUERY_KEY = 'bx-smarts-live';

/**
 * Fetches all smart-process types directly from the Bitrix portal REST API.
 *
 * - Requires the current portal to have a domain set in Redux.
 * - Each portal gets its own cache entry (queryKey includes portalId).
 * - Returns full data: each smart includes its categories with stages.
 */
export function useSmartsFromBitrix() {
    const portal = useCurrentPortal();
    const { client, isLoading: clientLoading } = useBitrixClient();

    const query = useQuery<BxSmartFullType[], Error>({
        queryKey: [BX_SMARTS_QUERY_KEY, portal?.id],
        queryFn: async () => {
            if (!client) throw new Error('Bitrix client not ready');
            const helper = new BitrixSmartHelper(client);
            return helper.getAllSmarts();
        },
        enabled: !!client && !!portal?.id,
        staleTime: 60_000,
    });

    return {
        smarts: Array.isArray(query.data) ? query.data : [],
        isLoading: clientLoading || query.isLoading,
        isError: query.isError,
        refetch: query.refetch,
    };
}
