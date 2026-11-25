'use client';
import { RefreshCw } from 'lucide-react';
import { HeaderAction } from '@/modules/shared';
import { useReportRecalculate } from '@/modules/feature/report-flow';
import { REPORT_CALCULATION_TEXT } from '../lib/report-header.texts';

/**
 * Кнопка «Пересчитать» в шапке: заново запрашивает отчёт мимо сохранённого
 * расчёта. Видна руководителям, когда показана строка о расчёте.
 */
export const RecalculateAction = () => {
    const { isAvailable, recalculate } = useReportRecalculate();
    if (!isAvailable) return null;

    return (
        <HeaderAction
            icon={RefreshCw}
            label={REPORT_CALCULATION_TEXT.recalculateLabel}
            hint={REPORT_CALCULATION_TEXT.recalculateHint}
            onClick={recalculate}
        />
    );
};
