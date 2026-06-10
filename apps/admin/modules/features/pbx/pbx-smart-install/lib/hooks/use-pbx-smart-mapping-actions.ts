'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BTX_SMARTS_QUERY_KEY } from '@/modules/entities/portal-bitrix/btx-smarts/constantas/btx-smarts.consts';
import { PbxSmartInstallHelper } from '../../api/pbx-smart-install-helper';
import type { PbxSmartMappingTarget } from '../../model/types';

const helper = new PbxSmartInstallHelper();

/**
 * Mutations for manually mapping template nodes to existing Bitrix entities.
 *
 * "Mapping" means recording in our DB that:
 *   template node (code) ↔ Bitrix entity (id/name)
 *
 * No Bitrix API write is performed — only our DB is updated.
 * After success, relevant react-query caches are invalidated so the diff
 * view re-calculates statuses automatically.
 */
export function usePbxSmartMappingActions() {
    const queryClient = useQueryClient();

    const mapNode = useMutation<void, Error, PbxSmartMappingTarget>({
        mutationFn: (target) => helper.mapNode(target),
        onSuccess: (_data, target) => {
            queryClient.invalidateQueries({ queryKey: [BTX_SMARTS_QUERY_KEY] });

            if (target.scope === 'map_category') {
                queryClient.invalidateQueries({ queryKey: ['btxCategories'] });
            }

            if (target.scope === 'map_field') {
                queryClient.invalidateQueries({ queryKey: ['bitrixFields'] });
            }
        },
    });

    return { mapNode };
}
