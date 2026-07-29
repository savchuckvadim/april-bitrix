'use client';

import { useAppSelector } from '@/modules/app';
import { selectCatalogReady } from '@/modules/entities/catalog';
import {
    selectAlternativeSets,
    selectGeneralSet,
    selectSelectedRow,
} from '@/modules/entities/row-set';
import {
    selectSnapshotStatus,
    selectSnapshotWarnings,
} from '@/modules/entities/snapshot';

/** Данные экрана PRODUCTS: сеты, статус вспоминания, готовность каталога */
export const usePriceTable = () => {
    const catalogReady = useAppSelector(selectCatalogReady);
    const general = useAppSelector(selectGeneralSet);
    const alternative = useAppSelector(selectAlternativeSets);
    const selectedRow = useAppSelector(selectSelectedRow);
    const snapshotStatus = useAppSelector(selectSnapshotStatus);
    const snapshotWarnings = useAppSelector(selectSnapshotWarnings);

    return {
        catalogReady,
        general,
        alternative,
        hasSelectedComposition: Boolean(selectedRow?.composition),
        isRestoring: snapshotStatus === 'loading',
        isRestored: snapshotStatus === 'restored',
        snapshotWarnings,
    };
};
