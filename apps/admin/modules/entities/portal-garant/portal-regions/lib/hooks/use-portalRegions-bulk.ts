'use client';

import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type {
    BulkPortalRegionItem,
    BulkSetPortalRegionsResult,
    PortalRegion,
} from '../../model';
import { PortalRegionsHelper } from '../api/portalRegions-helper';
import {
    applyOwnAbs,
    applyOwnSource,
    applyToggle,
    countInvalidOwnAbs,
    normalizeOwnAbsInput,
    regionRowState,
    toBulkItems,
    type PendingRegionChange,
    type RegionRowState,
    type ServerRegionState,
} from '../region-draft.util';
import { toSourceOptions } from '../region-view.util';

const helper = new PortalRegionsHelper();

const useBulkSetPortalRegions = () => {
    const queryClient = useQueryClient();

    return useMutation<
        BulkSetPortalRegionsResult,
        Error,
        { portalId: number; items: BulkPortalRegionItem[] }
    >({
        mutationFn: ({ portalId, items }) => helper.bulkSet(portalId, items),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portalRegions'] });
        },
    });
};

/**
 * Черновик правок регионов портала: галочки, ручной рабс и регион-источник
 * копятся локально, в систему уходят одним нажатием. Получает весь
 * справочник: источник можно выбрать и из региона, скрытого фильтром.
 */
export const usePortalRegionsDraft = (
    portalId: number,
    regions: PortalRegion[] | undefined,
) => {
    const bulk = useBulkSetPortalRegions();
    const [changes, setChanges] = useState<Map<number, PendingRegionChange>>(
        new Map(),
    );
    const [result, setResult] = useState<BulkSetPortalRegionsResult | null>(
        null,
    );

    const serverState = useMemo(() => {
        const map = new Map<number, ServerRegionState>();
        for (const region of regions ?? []) {
            map.set(Number(region.id), {
                enabled: region.isChecked,
                ownAbs: region.own_abs,
                ownAbsRegionId: region.own_abs_region_id,
            });
        }
        return map;
    }, [regions]);

    const absByRegionId = useMemo(
        () =>
            new Map(
                (regions ?? []).map(region => [Number(region.id), region.abs]),
            ),
        [regions],
    );

    const sourceOptions = useMemo(
        () => toSourceOptions(regions ?? []),
        [regions],
    );

    const rowState = useCallback(
        (regionId: number): RegionRowState =>
            regionRowState(changes, serverState, absByRegionId, regionId),
        [changes, serverState, absByRegionId],
    );

    const invalidCount = countInvalidOwnAbs(changes);

    const toggle = (regionId: number, enabled: boolean): void => {
        setResult(null);
        setChanges(previous =>
            applyToggle(previous, serverState, regionId, enabled),
        );
    };

    const setOwnAbsInput = (regionId: number, raw: string): void => {
        setResult(null);
        setChanges(previous =>
            applyOwnAbs(previous, regionId, normalizeOwnAbsInput(raw)),
        );
    };

    const setOwnSource = (regionId: number, sourceId: number): void => {
        setResult(null);
        setChanges(previous => applyOwnSource(previous, regionId, sourceId));
    };

    /** Возврат к общему рабсу: сервер сбрасывает и ручной рабс, и источник */
    const resetOwnPrice = (regionId: number): void => {
        setResult(null);
        setChanges(previous => applyOwnAbs(previous, regionId, null));
    };

    const reset = (): void => {
        setChanges(new Map());
        setResult(null);
        bulk.reset();
    };

    const save = (): void => {
        if (changes.size === 0 || invalidCount > 0) return;
        bulk.mutate(
            { portalId, items: toBulkItems(changes) },
            {
                onSuccess: response => {
                    setResult(response);
                    setChanges(new Map());
                },
            },
        );
    };

    return {
        changesCount: changes.size,
        invalidCount,
        sourceOptions,
        rowState,
        toggle,
        setOwnAbsInput,
        setOwnSource,
        resetOwnPrice,
        reset,
        save,
        result,
        isSaving: bulk.isPending,
        error: bulk.error,
    };
};

export type PortalRegionsDraft = ReturnType<typeof usePortalRegionsDraft>;
