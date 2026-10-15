'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { EReportType } from '../consts/report-type.consts';
import { useReportType } from './report-type.hook';

/** Параметр URL вкладки отчёта: `?tab=digest` открывает «Дайджест». */
export const REPORT_TYPE_PARAM = 'tab';

const REPORT_TYPES = new Set<string>(Object.values(EReportType));

/**
 * Ссылка на вкладку отчёта: значение `?tab=` применяется один раз на каждое
 * новое значение (дальше пользователь переключает вкладки сам). Доступность
 * вкладки по правам проверяет useEnsureAvailableReportType.
 */
export const useReportTypeFromUrl = () => {
    const searchParams = useSearchParams();
    const { setCurrentReportType } = useReportType();
    const applied = useRef<string | null>(null);
    const value = searchParams.get(REPORT_TYPE_PARAM);

    useEffect(() => {
        if (!value || applied.current === value || !REPORT_TYPES.has(value)) return;
        applied.current = value;
        setCurrentReportType(value as EReportType);
        // setCurrentReportType стабилен (bound action creator)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);
};
