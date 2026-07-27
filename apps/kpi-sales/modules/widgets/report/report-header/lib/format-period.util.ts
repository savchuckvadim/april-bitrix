import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

/** ISO-дата '2025-10-01' → «1 октября 2025 г» (пустой вход → ''). */
export const formatReportDate = (input?: string) => {
    if (!input) return '';
    return format(parseISO(input), "d MMMM yyyy 'г'", { locale: ru });
};

/** Подпись периода отчёта в хедере: «с 1 октября 2025 г по …». */
export const formatReportPeriod = (from?: string, to?: string) =>
    `с ${formatReportDate(from)} по ${formatReportDate(to)}`;
