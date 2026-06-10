'use client';

import { useQuery } from '@tanstack/react-query';
import { useCurrentPortal } from '@/modules/entities/portal';
import { bitrixPortalClient } from '../lib/bitrix-portal-client';
import type { BitrixService } from '@workspace/bitrix';

/**
 * Returns an initialized BitrixService for the current portal.
 *
 * - Reads domain from Redux state.portal.current (set by [portalId]/layout.tsx)
 * - Initialisation is performed once per domain and cached in bitrixPortalClient
 * - data is undefined while loading or if the portal has no domain
 */
export function useBitrixClient(): {
    client: BitrixService | undefined;
    isLoading: boolean;
    isError: boolean;
} {
    const portal = useCurrentPortal();
    const domain = portal?.domain;

    const query = useQuery<BitrixService, Error>({
        queryKey: ['bitrix-client', domain],
        queryFn: () => {
            if (!domain) throw new Error('Portal domain is not set');
            return bitrixPortalClient.getClient(domain);
        },
        enabled: !!domain,
        // Client object is stable — no need to refetch automatically
        staleTime: Infinity,
        gcTime: Infinity,
    });

    return {
        client: query.data,
        isLoading: query.isLoading,
        isError: query.isError,
    };
}
