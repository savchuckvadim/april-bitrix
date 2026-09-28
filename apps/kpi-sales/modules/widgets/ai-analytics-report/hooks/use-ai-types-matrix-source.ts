'use client';

import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app';
import {
    aiMatrixPresentTypes,
    fetchAiTypesMatrix,
    isAiKpiOnly,
    type AiByTypeWideRow,
    type AiCallType,
} from '@/modules/entities/ai-analytics';
import { useAiSection } from './use-ai-section';
import { useAiManagerName } from './use-ai-manager-name';

const NO_ROWS: AiByTypeWideRow[] = [];
const NO_CALL_TYPES: AiCallType[] = [];

/**
 * Общий источник блоков-матриц KPI-вида: секция typesMatrix (срез «все
 * типы × wide» в периметре обзора), загрузка при монтировании (гард
 * thunk не даст дублей от двух блоков; в kpi-only разборов нет — не
 * запрашиваем), строки, справочник типов портала, типы со звонками за
 * период и подпись менеджера. Смена фильтра перезапрашивает секцию
 * listener сущности — блоки перерисуются по стору.
 */
export const useAiTypesMatrixSource = () => {
    const dispatch = useAppDispatch();
    const section = useAiSection('typesMatrix');
    const kpiOnly = useAppSelector(state =>
        isAiKpiOnly(state.aiAnalytics.settings.data?.readiness.mode),
    );
    const callTypes =
        useAppSelector(state => state.aiAnalytics.settings.data?.callTypes) ??
        NO_CALL_TYPES;
    const managerName = useAiManagerName();

    useEffect(() => {
        if (kpiOnly) return;
        dispatch(fetchAiTypesMatrix());
    }, [dispatch, kpiOnly]);

    const rows = section.data?.wide ?? NO_ROWS;
    const presentTypes = useMemo(
        () => aiMatrixPresentTypes(rows, callTypes),
        [rows, callTypes],
    );

    return {
        section,
        rows,
        totalsByType: section.data?.totalsByType ?? null,
        callTypes,
        presentTypes,
        managerName,
    };
};
