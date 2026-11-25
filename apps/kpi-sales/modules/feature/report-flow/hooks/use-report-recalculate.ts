'use client';

import { useCallback } from 'react';
import { useAccess } from '@/modules/app/lib/access/use-access';
import { useAppDispatch } from '@/modules/app/lib/hooks/redux';
import { EAccessFeature } from '@/modules/shared/access';
import { recalculateReportData } from '../model/recalculate-report-data.thunk';
import { useReportCalculatedAt } from './use-report-calculation';

/**
 * Пересчёт отчёта для кнопки «Пересчитать». Кнопка нужна, когда отчёт взят
 * из сохранённого расчёта (в шапке показана дата) и пересчитывать его вправе
 * руководитель (правило REPORT_RECALCULATE).
 */
export const useReportRecalculate = () => {
    const dispatch = useAppDispatch();
    const calculatedAt = useReportCalculatedAt();
    const canRecalculate = useAccess(EAccessFeature.REPORT_RECALCULATE);

    const recalculate = useCallback(() => {
        dispatch(recalculateReportData());
    }, [dispatch]);

    return { isAvailable: calculatedAt !== null && canRecalculate, recalculate };
};
