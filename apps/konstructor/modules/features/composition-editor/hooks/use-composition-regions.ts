'use client';

import { useMemo, useState } from 'react';
import type { Catalog } from '@/modules/entities/catalog';
import { REGION_ROOT_CODE, type Composition } from '@/modules/entities/composition';
import { describeRegions, REGION_ROOT_TITLE } from '../lib/regions-summary.util';

/**
 * Региональный блок состава: название и строка под ним (вес регионов, перечень)
 * и открытие окна «Регионы». Окно монтируется только открытым, поэтому здесь
 * живёт один признак.
 */
export const useCompositionRegions = (
    catalog: Catalog,
    composition: Composition | null,
    clientRegionCode: string | null,
) => {
    const [open, setOpen] = useState(false);
    const rootName = catalog.infoblocks[REGION_ROOT_CODE]?.name ?? REGION_ROOT_TITLE;
    const summary = useMemo(
        () => (composition ? describeRegions(catalog, composition, clientRegionCode, rootName) : null),
        [catalog, composition, clientRegionCode, rootName],
    );

    return {
        summary,
        open,
        openDialog: () => setOpen(true),
        closeDialog: () => setOpen(false),
    };
};
