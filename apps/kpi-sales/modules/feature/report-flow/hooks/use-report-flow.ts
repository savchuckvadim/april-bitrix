'use client';

import { useCallback, useEffect } from 'react';
import { useAppDispatch } from '@/modules/app/lib/hooks/redux';
import { ensureReportData } from '../model/ensure-report-data.thunk';
import { applyFilterDraft } from '../model/filter-draft/report-filter-draft.thunks';

/**
 * Flow-операции отчёта для виджетов: применение фильтра (сохранение
 * фильтра — в useSaveFilter). Также страхует загрузку: при появлении шапки
 * отчёта докачивает то, что текущей вкладке нужно и ещё не загружено
 * (первичную загрузку делает listener-цепочка, смену вкладки — listener
 * вкладки). Страховка срабатывает один раз на маунт: после сбоя расчёта
 * она не повторяет запрос по кругу — пользователь нажимает «Применить».
 */
export const useReportFlow = () => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(ensureReportData());
    }, [dispatch]);

    /**
     * Кнопка «Применить»: черновик фильтра переходит в действующий фильтр,
     * панель закрывается, перезапрашиваются события и звонки — те из них,
     * что нужны текущей вкладке (исторический баг: раньше дёргался только
     * KPI, и звонки «применялись» лишь после сохранения фильтра и
     * перезагрузки).
     */
    const applyFilter = useCallback(() => {
        dispatch(applyFilterDraft());
    }, [dispatch]);

    return { applyFilter };
};
