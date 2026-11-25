'use client';
import { useReportCalculatedAt } from '@/modules/feature/report-flow';
import { useIsUserReport } from '../../lib/use-is-user-report';
import { formatCalculatedAt } from '../lib/format-calculated-at.util';
import { REPORT_CALCULATION_TEXT } from '../lib/report-header.texts';

/**
 * Строка «рассчитано 12.11 в 10:40» рядом с периодом: отчёт за прошлый
 * период взят из сохранённого расчёта, и она объясняет, почему цифры не
 * меняются. Нет сведений о расчёте (период открытый, сервер старый, вкладка
 * без событий и звонков) и страница сотрудника — строки нет.
 */
export const CalculatedAtNote = () => {
    const calculatedAt = useReportCalculatedAt();
    const isUserReport = useIsUserReport();
    if (isUserReport || !calculatedAt) return null;

    const text = formatCalculatedAt(calculatedAt);
    if (!text) return null;

    return (
        <span className="text-foreground-muted ml-2 text-xs">
            {REPORT_CALCULATION_TEXT.calculatedAt} {text}
        </span>
    );
};
