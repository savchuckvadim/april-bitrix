'use client';
import { ThemeTogglePanel } from '@workspace/theme';
import { useReportPeriod } from '../hooks/use-report-header';

/** Левая часть хедера: переключатель темы + «KPI» с периодом отчёта. */
export const ReportTitle = () => {
    const period = useReportPeriod();

    return (
        <div className="flex flex-row items-center">
            <ThemeTogglePanel />
            <h1 className="text-md ml-2 font-bold">
                KPI
                <span className="text-foreground-muted ml-2 text-xs">
                    {period}
                </span>
            </h1>
        </div>
    );
};
