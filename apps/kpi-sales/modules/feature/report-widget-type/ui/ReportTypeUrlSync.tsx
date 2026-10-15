'use client';

import { useReportTypeFromUrl } from '../hooks/use-report-type-from-url';

/** Watcher: применяет `?tab=` к вкладке отчёта, ничего не рендерит. */
export const ReportTypeUrlSync = () => {
    useReportTypeFromUrl();
    return null;
};
