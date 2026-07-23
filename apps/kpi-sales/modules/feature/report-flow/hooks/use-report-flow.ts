'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { getReportData, saveFilter } from '../model/report-flow-thunks';

/**
 * Flow-операции отчёта для виджетов: обновление и сохранение фильтра.
 * Также страхует загрузку: если отчёт сброшен (isFetched=false) —
 * перезапрашивает (первичную загрузку делает listener-цепочка).
 */
export const useReportFlow = () => {
    const dispatch = useAppDispatch();
    const isFetched = useAppSelector(state => state.report.isFetched);
    const isLoading = useAppSelector(state => state.report.isLoading);
    const isFilterLoading = useAppSelector(
        state => state.report.isFilterLoading,
    );

    useEffect(() => {
        if (!isFetched && !isLoading) {
            dispatch(getReportData());
        }
    }, [dispatch, isFetched, isLoading]);

    return {
        isFilterLoading,
        refreshReport: () => dispatch(getReportData()),
        saveFilter: () => dispatch(saveFilter()),
    };
};
