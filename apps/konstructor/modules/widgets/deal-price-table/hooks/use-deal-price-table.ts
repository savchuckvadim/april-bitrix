'use client';

import { useAppSelector } from '@/modules/app';
import {
    selectSnapshotStatus,
    selectSnapshotWarnings,
} from '@/modules/entities/snapshot';
import { useDealSummaryActions } from '@/modules/features/deal-send';

/**
 * Что сделка добавляет к шагу «Цены»: вспоминание слепка и его замечания, а
 * также кнопки сделки в «Итоге» (со сделкой — «Сохранить» рядом с «Далее», без
 * сделки — «Создать» вместо «Далее»).
 */
export const useDealPriceTable = () => {
    const snapshotStatus = useAppSelector(selectSnapshotStatus);
    const snapshotWarnings = useAppSelector(selectSnapshotWarnings);
    const summary = useDealSummaryActions();

    return {
        isRestoring: snapshotStatus === 'loading',
        snapshotWarnings,
        summary,
    };
};
