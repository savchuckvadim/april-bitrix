'use client';

import { useQuery } from '@tanstack/react-query';
import { useBitrixClient } from '@/modules/entities/bitrix/bitrix-client';
import { useCurrentPortal } from '@/modules/entities/portal';
import { BitrixSmartHelper } from '../api/bitrix-smart.helper';
import type { IUserFieldConfig } from '@workspace/bitrix';

export const BX_FIELDS_QUERY_KEY = 'bx-fields-live';

/**
 * Fetches user fields for a specific Bitrix smart-process entityTypeId.
 * Returns UF_CRM_DYNAMIC_* fields from the portal.
 * Enabled only when entityTypeId is provided.
 */
export function useFieldsFromBitrix(entityTypeId: number | string | undefined) {
    const portal = useCurrentPortal();
    const { client, isLoading: clientLoading } = useBitrixClient();

    const query = useQuery<IUserFieldConfig[], Error>({
        queryKey: [BX_FIELDS_QUERY_KEY, portal?.id, entityTypeId],
        queryFn: async () => {
            if (!client) throw new Error('Bitrix client not ready');
            if (!entityTypeId) return [];
            const helper = new BitrixSmartHelper(client);
            return helper.getFieldsForSmart(entityTypeId);
        },
        enabled: !!client && !!portal?.id && !!entityTypeId,
        staleTime: 60_000,
    });

    return {
        fields: Array.isArray(query.data) ? query.data : [],
        isLoading: clientLoading || query.isLoading,
        isError: query.isError,
        refetch: query.refetch,
    };
}
