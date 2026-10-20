'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app';
import {
    aiPlanFactMonthKey,
    aiToday,
    fetchAiAttention,
    fetchAiOverview,
    fetchAiPlanFact,
    fetchAiPulse,
    fetchAiSettings,
    isAiKpiOnly,
    selectAiOverviewScope,
} from '@/modules/entities/ai-analytics';
import { useAiDossier, useAiStyle } from '@/modules/widgets/ai-analytics-report';

/**
 * Запросы AI-раздела страницы сотрудника. Общие с вкладкой AI секции
 * (настройки, обзор, «Внимание», пульс) — те же thunks с гардами: если
 * вкладка уже загрузила их в стор, повторного запроса не будет. По
 * сотруднику — план-факт месяца (месяц — конец периода отчёта, иначе
 * текущий), досье за окно месяцев и карточка стиля (очередь + WS, где
 * есть). В kpi-only разборов нет — секции с оценками не запрашиваются.
 */
export const useAiEmployeeSources = (
    managerId: string,
    enabled: boolean,
    months: number,
) => {
    const dispatch = useAppDispatch();
    const kpiOnly = useAppSelector(state =>
        isAiKpiOnly(state.aiAnalytics.settings.data?.readiness.mode),
    );
    const from = useAppSelector(
        state => selectAiOverviewScope(state)?.filters.from ?? null,
    );
    const to = useAppSelector(
        state => selectAiOverviewScope(state)?.filters.to ?? null,
    );
    const monthKey = aiPlanFactMonthKey(to) ?? aiToday().slice(0, 7);
    const active = enabled && !kpiOnly;

    useEffect(() => {
        if (!enabled) return;
        dispatch(fetchAiSettings());
    }, [dispatch, enabled]);

    useEffect(() => {
        if (!active) return;
        dispatch(fetchAiOverview());
        dispatch(fetchAiAttention());
        dispatch(fetchAiPulse());
    }, [dispatch, active]);

    useEffect(() => {
        if (!active) return;
        dispatch(fetchAiPlanFact({ monthKey, managerIds: [managerId] }));
    }, [dispatch, active, monthKey, managerId]);

    const dossier = useAiDossier(managerId, months, active);
    const style = useAiStyle(managerId, undefined, active);

    return {
        kpiOnly,
        period: from && to ? { from, to } : null,
        monthKey,
        dossier,
        style,
        /** Повторить план-факт за месяц сотрудника, минуя кэш. */
        retryPlanFact: () =>
            dispatch(fetchAiPlanFact({ monthKey, managerIds: [managerId] }, true)),
        retryOverview: () => dispatch(fetchAiOverview({ force: true })),
    };
};
