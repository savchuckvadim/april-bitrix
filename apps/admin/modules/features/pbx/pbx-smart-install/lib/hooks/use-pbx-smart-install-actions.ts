'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BTX_SMARTS_QUERY_KEY } from '@/modules/entities/portal-bitrix/btx-smarts/constantas/btx-smarts.consts';
import { PbxSmartInstallHelper } from '../../api/pbx-smart-install-helper';
import type { PbxSmartInstallTarget } from '../../model/types';

const helper = new PbxSmartInstallHelper();

/**
 * Mutations for installing / syncing PBX nodes from the template.
 * After success, relevant react-query caches are invalidated so the diff
 * view reflects the new state automatically.
 */
export function usePbxSmartInstallActions() {
    const queryClient = useQueryClient();

    const installNode = useMutation<void, Error, PbxSmartInstallTarget>({
        mutationFn: (target) => helper.installNode(target),
        onSuccess: (_data, target) => {
            // Invalidate smarts list so the diff picks up the new record
            queryClient.invalidateQueries({ queryKey: [BTX_SMARTS_QUERY_KEY] });

            if (
                target.scope === 'smart_category' ||
                target.scope === 'smart_stage'
            ) {
                queryClient.invalidateQueries({ queryKey: ['btxCategories'] });
            }

            if (
                target.scope === 'smart_field' ||
                target.scope === 'smart_field_item'
            ) {
                queryClient.invalidateQueries({ queryKey: ['bitrixFields'] });
            }
        },
    });

    const syncNode = useMutation<void, Error, PbxSmartInstallTarget>({
        mutationFn: (target) => helper.syncNode(target),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BTX_SMARTS_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: ['btxCategories'] });
            queryClient.invalidateQueries({ queryKey: ['bitrixFields'] });
        },
    });

    return { installNode, syncNode };
}
