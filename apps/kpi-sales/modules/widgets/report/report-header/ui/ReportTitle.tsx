'use client';
import { ThemeTogglePanel } from '@workspace/theme';
import { useReportPeriod } from '../hooks/use-report-header';
import { CalculatedAtNote } from './CalculatedAtNote';

/**
 * Левая часть хедера: переключатель темы + «KPI» с периодом отчёта и, если
 * отчёт взят из сохранённого расчёта, строка о времени расчёта.
 */
export const ReportTitle = () => {
    const period = useReportPeriod();

    return (
        <div className="flex flex-row items-center">
            <ThemeTogglePanel align="start" />
            <h1 className="text-md ml-2 font-bold">
                KPI
                <span className="text-foreground-muted ml-2 text-xs">
                    {period}
                </span>
            </h1>
            <CalculatedAtNote />
        </div>
    );
};
