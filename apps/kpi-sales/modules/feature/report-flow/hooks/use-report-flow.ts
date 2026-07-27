'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { getReportData } from '../model/report-flow-thunks';

/**
 * Flow-операции отчёта для виджетов: обновление отчёта (сохранение
 * фильтра — в useSaveFilter). Также страхует загрузку: если отчёт
 * сброшен (isFetched=false) — перезапрашивает (первичную загрузку
 * делает listener-цепочка).
 */
export const useReportFlow = () => {
    const dispatch = useAppDispatch();
    const isFetched = useAppSelector(state => state.report.isFetched);
    const isLoading = useAppSelector(state => state.report.isLoading);

    useEffect(() => {
        if (!isFetched && !isLoading) {
            dispatch(getReportData());
        }
    }, [dispatch, isFetched, isLoading]);

    return {
        refreshReport: () => dispatch(getReportData()),
    };
};
