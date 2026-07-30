'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { getReportData } from '../model/report-flow-thunks';
import { getCallingStatistics } from '../model/calling-statistics-flow-thunk';

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
        /**
         * Кнопка «Применить»: перезапрашивает ОБА отчёта. Исторический баг:
         * здесь дёргался только KPI — статистика звонков обновлялась лишь
         * маунт-цепочкой сохранённого фильтра, поэтому смена периода
         * «применялась» к звонкам только после сохранения+перезагрузки.
         */
        refreshReport: () => {
            void dispatch(getReportData());
            void dispatch(getCallingStatistics());
        },
    };
};
