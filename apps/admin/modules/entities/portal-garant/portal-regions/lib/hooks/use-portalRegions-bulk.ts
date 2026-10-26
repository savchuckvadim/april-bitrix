'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getAdminPortalGarantRegion,
    type BulkPortalRegionItemDto,
    type BulkSetPortalRegionsResultDto,
    type GetPortalRegionResponseDto,
} from '@workspace/nest-admin-api';
import {
    applyOwnAbs,
    applyToggle,
    effectiveState,
    toBulkItems,
    type PendingRegionChange,
    type ServerRegionState,
} from '../region-draft.util';

export type { PendingRegionChange };

const api = getAdminPortalGarantRegion();

/** Отправка накопленных правок одним запросом */
export const useBulkSetPortalRegions = () => {
    const queryClient = useQueryClient();

    return useMutation<
        BulkSetPortalRegionsResultDto,
        Error,
        { portalId: number; items: BulkPortalRegionItemDto[] }
    >({
        mutationFn: ({ portalId, items }) =>
            api.adminPortalGarantRegionBulkSet({ portalId, items }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portalRegions'] });
        },
    });
};

/**
 * Черновик правок регионов портала: галочки и свои рабсы копятся
 * локально, в систему уходят одним нажатием. Так видно, что именно
 * меняется, и не летит запрос на каждый щелчок.
 */
export const usePortalRegionsDraft = (
    portalId: number,
    regions: GetPortalRegionResponseDto[] | undefined,
) => {
    const bulk = useBulkSetPortalRegions();
    const [changes, setChanges] = React.useState<
        Map<number, PendingRegionChange>
    >(new Map());
    const [result, setResult] =
        React.useState<BulkSetPortalRegionsResultDto | null>(null);

    const serverState = React.useMemo(() => {
        const map = new Map<number, ServerRegionState>();
        for (const region of regions ?? []) {
            map.set(Number(region.id), { enabled: region.isChecked });
        }
        return map;
    }, [regions]);

    const effective = React.useCallback(
        (regionId: number): PendingRegionChange =>
            effectiveState(changes, serverState, regionId),
        [changes, serverState],
    );

    const toggle = (regionId: number, enabled: boolean): void => {
        setResult(null);
        setChanges(previous =>
            applyToggle(previous, serverState, regionId, enabled),
        );
    };

    const setOwnAbs = (regionId: number, ownAbs: string | null): void => {
        setResult(null);
        setChanges(previous =>
            applyOwnAbs(previous, regionId, ownAbs),
        );
    };

    const reset = (): void => {
        setChanges(new Map());
        setResult(null);
        bulk.reset();
    };

    const save = async (): Promise<void> => {
        if (changes.size === 0) return;
        const response = await bulk.mutateAsync({
            portalId,
            items: toBulkItems(changes),
        });
        setResult(response);
        setChanges(new Map());
    };

    return {
        changes,
        changesCount: changes.size,
        effective,
        toggle,
        setOwnAbs,
        reset,
        save,
        result,
        isSaving: bulk.isPending,
        error: bulk.error,
    };
};
