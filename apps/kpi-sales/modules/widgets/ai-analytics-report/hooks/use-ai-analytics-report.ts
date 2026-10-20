'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { shallowEqual } from 'react-redux';
import {
    selectIsViewAs,
    useAccess,
    useAppDispatch,
    useAppSelector,
} from '@/modules/app';
import { EAccessFeature } from '@/modules/shared/access';
import {
    AI_FEEDBACK_OBJECT,
    aiToday,
    fetchAiAgenda,
    fetchAiAttention,
    fetchAiOverview,
    fetchAiPulse,
    isAiKpiOnly,
    recalcAiOverview,
    refreshAiAnalytics,
    selectAiOverviewScope,
    selectAiRequester,
    selectAiScopeNote,
    sendAiView,
} from '@/modules/entities/ai-analytics';
import { buildAiSetupChecklist } from '../lib/ai-setup-checklist.util';
import { useAiManagerName } from './use-ai-manager-name';
import { useAiTab } from './use-ai-tab';

/**
 * Состояние вкладки «AI аналитика»: загрузка пульса, повестки, обзора и
 * «Внимания» при монтировании (thunk-гарды не дадут дублей), view-
 * телеметрия от реального пользователя (повтор после выхода из «Смотреть
 * как…»), «Обновить» / «Пересчитать», подвкладка из URL и переход к
 * секции настроек на её подвкладке, чек-лист готовности витрины. В
 * kpi-only оценок нет — секции не запрашиваются, показывается баннер с
 * чек-листом.
 */
export const useAiAnalyticsReport = () => {
    const dispatch = useAppDispatch();
    const settings = useAppSelector(state => state.aiAnalytics.settings);
    const pulseStatus = useAppSelector(state => state.aiAnalytics.pulse.status);
    const agendaStatus = useAppSelector(
        state => state.aiAnalytics.agenda.status,
    );
    const overview = useAppSelector(state => state.aiAnalytics.overview);
    const dailyPlanSection = useAppSelector(
        state => state.aiAnalytics.dailyPlan,
    );
    const dailyPlanDate = useAppSelector(
        state => state.aiAnalytics.dailyPlanQuery?.date ?? null,
    );
    const planFact = useAppSelector(state => state.aiAnalytics.planFact.data);
    // Прогноз отдела (Фаза 4) — только руководителю: месяцы в тени и точность.
    const forecast = useAppSelector(state =>
        state.aiAnalytics.forecast.status === 'ready'
            ? state.aiAnalytics.forecast.data
            : null,
    );
    // Период обрезан до лимита бэка — плашка с точными датами AI и фильтра.
    const clampedPeriod = useAppSelector(state => {
        const scope = selectAiOverviewScope(state);
        if (!scope?.clamped) return null;
        return {
            from: scope.filters.from,
            to: scope.filters.to,
            filterFrom: state.report.date.from,
            filterTo: state.report.date.to,
        };
    }, shallowEqual);
    const scopeNote = useAppSelector(selectAiScopeNote, shallowEqual);
    const isViewAs = useAppSelector(selectIsViewAs);
    const requesterId = useAppSelector(
        state => selectAiRequester(state)?.requesterUserId ?? null,
    );
    const managerName = useAiManagerName();
    const canViewAll = useAccess(EAccessFeature.AI_VIEW_ALL);
    const canConfigure = useAccess(EAccessFeature.AI_CONFIGURE);
    // Подвкладка и секция настроек — из URL: «Уровни» из шапки, остальные —
    // из чек-листа готовности и плана дня («Цели», «Состав»).
    const { tab, section, setTab, openSettings } = useAiTab();

    const kpiOnly = isAiKpiOnly(settings.data?.readiness.mode);
    // План дня в чек-листе — лишь деталь пункта «Цель месяца» и только
    // актуальный: готовый ответ на запрос за сегодня (не за другой день).
    const today = aiToday();
    const dailyPlan =
        dailyPlanSection.status === 'ready' && dailyPlanDate === today
            ? dailyPlanSection.data
            : null;

    useEffect(() => {
        if (kpiOnly) return;
        dispatch(fetchAiPulse());
        dispatch(fetchAiAgenda());
        dispatch(fetchAiOverview());
        dispatch(fetchAiAttention());
    }, [dispatch, kpiOnly]);

    // View — от реального пользователя: в «Смотреть как…» thunk молчит и
    // объект не помечает, после выхода эффект повторяется и view уходит.
    useEffect(() => {
        if (kpiOnly || isViewAs || !requesterId) return;
        dispatch(sendAiView(AI_FEEDBACK_OBJECT.PULSE));
    }, [dispatch, kpiOnly, isViewAs, requesterId]);

    const checklist = useMemo(
        () =>
            settings.data
                ? buildAiSetupChecklist({
                      settings: settings.data,
                      overview: overview.data,
                      overviewError:
                          overview.status === 'error' ? overview.error : null,
                      dailyPlan,
                      planFact,
                      forecast,
                      managerName,
                      today,
                      canConfigure,
                  })
                : null,
        [
            settings.data,
            overview.data,
            overview.status,
            overview.error,
            dailyPlan,
            planFact,
            forecast,
            managerName,
            today,
            canConfigure,
        ],
    );

    const refresh = useCallback(
        () => dispatch(refreshAiAnalytics()),
        [dispatch],
    );
    const recalc = useCallback(() => dispatch(recalcAiOverview()), [dispatch]);
    const openLevels = useCallback(() => openSettings('levels'), [openSettings]);
    const openTargets = useCallback(
        () => openSettings('targets'),
        [openSettings],
    );

    return {
        settings: settings.data,
        checklist,
        kpiOnly,
        canViewAll,
        canConfigure,
        clampedPeriod,
        scopeNote,
        isRefreshing: pulseStatus === 'loading' || agendaStatus === 'loading',
        isRecalculating: overview.status === 'loading',
        /** Подвкладка из URL и секция настроек, к которой прокрутить. */
        tab,
        section,
        setTab,
        openSettings,
        openLevels,
        openTargets,
        refresh,
        recalc,
    };
};
