'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAccess, useAppDispatch, useAppSelector } from '@/modules/app';
import { EAccessFeature } from '@/modules/shared/access';
import {
    AI_FEEDBACK_OBJECT,
    fetchAiAgenda,
    fetchAiAttention,
    fetchAiOverview,
    fetchAiPulse,
    isAiKpiOnly,
    recalcAiOverview,
    refreshAiAnalytics,
    selectAiOverviewScope,
    sendAiView,
} from '@/modules/entities/ai-analytics';

/**
 * Состояние вкладки «AI аналитика»: загрузка пульса, повестки, обзора и
 * «Внимания» при монтировании (thunk-гарды не дадут дублей), view-
 * телеметрия один раз за сессию, «Обновить» (пульс/повестка) и
 * «Пересчитать» (forceRefresh обзора), диалог уровней. В режиме kpi-only
 * оценок нет — секции не запрашиваются, показывается только баннер.
 */
export const useAiAnalyticsReport = () => {
    const dispatch = useAppDispatch();
    const settings = useAppSelector(state => state.aiAnalytics.settings);
    const pulseStatus = useAppSelector(state => state.aiAnalytics.pulse.status);
    const agendaStatus = useAppSelector(
        state => state.aiAnalytics.agenda.status,
    );
    const overviewStatus = useAppSelector(
        state => state.aiAnalytics.overview.status,
    );
    const periodClamped = useAppSelector(
        state => selectAiOverviewScope(state)?.clamped ?? false,
    );
    const canViewAll = useAccess(EAccessFeature.AI_VIEW_ALL);
    const canConfigure = useAccess(EAccessFeature.AI_CONFIGURE);
    const [levelsOpen, setLevelsOpen] = useState(false);

    const kpiOnly = isAiKpiOnly(settings.data?.readiness.mode);

    useEffect(() => {
        if (kpiOnly) return;
        dispatch(fetchAiPulse());
        dispatch(fetchAiAgenda());
        dispatch(fetchAiOverview());
        dispatch(fetchAiAttention());
        dispatch(sendAiView(AI_FEEDBACK_OBJECT.PULSE));
    }, [dispatch, kpiOnly]);

    const refresh = useCallback(
        () => dispatch(refreshAiAnalytics()),
        [dispatch],
    );
    const recalc = useCallback(() => dispatch(recalcAiOverview()), [dispatch]);

    return {
        settings: settings.data,
        kpiOnly,
        canViewAll,
        canConfigure,
        periodClamped,
        isRefreshing: pulseStatus === 'loading' || agendaStatus === 'loading',
        isRecalculating: overviewStatus === 'loading',
        levelsOpen,
        openLevels: () => setLevelsOpen(true),
        setLevelsOpen,
        refresh,
        recalc,
    };
};
