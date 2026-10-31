'use client';

import { useAppSelector } from '@/modules/app';
import {
    selectSnapshotStatus,
    selectSnapshotWarnings,
} from '@/modules/entities/snapshot';

/** Что сделка добавляет к шагу «Цены»: вспоминание слепка и его замечания. */
export const useDealPriceTable = () => {
    const snapshotStatus = useAppSelector(selectSnapshotStatus);
    const snapshotWarnings = useAppSelector(selectSnapshotWarnings);

    return {
        isRestoring: snapshotStatus === 'loading',
        snapshotWarnings,
    };
};
