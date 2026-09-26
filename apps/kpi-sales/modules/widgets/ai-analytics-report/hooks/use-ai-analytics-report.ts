'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
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
    sendAiView,
} from '@/modules/entities/ai-analytics';
import type { AiSettingsTab } from '../lib/ai-settings-form.util';
import { buildAiSetupChecklist } from '../lib/ai-setup-checklist.util';
import { useAiManagerName } from './use-ai-manager-name';

/**
 * Состояние вкладки «AI аналитика»: загрузка пульса, повестки, обзора и
 * «Внимания» при монтировании (thunk-гарды не дадут дублей), view-
 * телеметрия от реального пользователя (повтор после выхода из «Смотреть
 * как…»), «Обновить» / «Пересчитать», диалог настроек на нужной вкладке и
 * чек-лист готовности витрины. В kpi-only оценок нет — секции не
 * запрашиваются, показывается баннер с чек-листом.
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
    const periodClamped = useAppSelector(
        state => selectAiOverviewScope(state)?.clamped ?? false,
    );
    const isViewAs = useAppSelector(selectIsViewAs);
    const requesterId = useAppSelector(
        state => selectAiRequester(state)?.requesterUserId ?? null,
    );
    const managerName = useAiManagerName();
    const canViewAll = useAccess(EAccessFeature.AI_VIEW_ALL);
    const canConfigure = useAccess(EAccessFeature.AI_CONFIGURE);
    const [settingsOpen, setSettingsOpen] = useState(false);
    // Вкладка диалога настроек при открытии: «Уровни» из шапки, остальные —
    // из чек-листа готовности и плана дня («Цели», «Состав»).
    const [settingsTab, setSettingsTab] = useState<AiSettingsTab>('levels');

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
    const openSettings = useCallback((tab: AiSettingsTab) => {
        setSettingsTab(tab);
        setSettingsOpen(true);
    }, []);

    return {
        settings: settings.data,
        checklist,
        kpiOnly,
        canViewAll,
        canConfigure,
        periodClamped,
        isRefreshing: pulseStatus === 'loading' || agendaStatus === 'loading',
        isRecalculating: overview.status === 'loading',
        levelsOpen: settingsOpen,
        levelsTab: settingsTab,
        openSettings,
        openLevels: () => openSettings('levels'),
        openRoster: () => openSettings('roster'),
        openTargets: () => openSettings('targets'),
        setLevelsOpen: setSettingsOpen,
        refresh,
        recalc,
    };
};
