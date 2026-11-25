'use client';

import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { getReportData } from '../model/report-flow-thunks';
import { applyFilterDraft } from '../model/filter-draft/report-filter-draft.thunks';

/**
 * Flow-операции отчёта для виджетов: применение фильтра (сохранение
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

    /**
     * Кнопка «Применить»: черновик фильтра переходит в действующий фильтр,
     * панель закрывается, перезапрашиваются ОБА отчёта — KPI и статистика
     * звонков (исторический баг: раньше дёргался только KPI, и звонки
     * «применялись» лишь после сохранения фильтра и перезагрузки).
     */
    const applyFilter = useCallback(() => {
        dispatch(applyFilterDraft());
    }, [dispatch]);

    return { applyFilter };
};
