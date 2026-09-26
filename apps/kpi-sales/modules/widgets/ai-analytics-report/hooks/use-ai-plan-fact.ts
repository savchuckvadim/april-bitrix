'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app';
import {
    aiPlanFactMonthKey,
    fetchAiPlanFact,
    selectAiIsLeader,
    selectAiOverviewScope,
    type AiPlanFact,
    type AiPlanFactQuery,
    type AiStatus,
} from '@/modules/entities/ai-analytics';
import { useAiManagerName } from './use-ai-manager-name';

/**
 * Состояние карточки «План — факт»: месяц — конец периода глобального
 * фильтра, менеджеры — выбранные в фильтре (руководителю; менеджеру
 * периметр отсекает сервер), запрос при смене входов (гарды thunk не дадут
 * дублей), «Обновить» с force. Пока в сторе ответ на другой запрос —
 * секция показывается как loading, а не чужими данными.
 */
export const useAiPlanFact = () => {
    const dispatch = useAppDispatch();
    const section = useAppSelector(state => state.aiAnalytics.planFact);
    const query = useAppSelector(state => state.aiAnalytics.planFactQuery);
    const isLeader = useAppSelector(selectAiIsLeader);
    const to = useAppSelector(
        state => selectAiOverviewScope(state)?.filters.to ?? null,
    );
    const managerIdsKey = useAppSelector(state =>
        (selectAiOverviewScope(state)?.filters.managerIds ?? []).join(','),
    );
    const managerName = useAiManagerName();

    const monthKey = aiPlanFactMonthKey(to);
    const wanted = useMemo<AiPlanFactQuery | null>(() => {
        if (!monthKey) return null;
        const managerIds = managerIdsKey ? managerIdsKey.split(',') : [];
        return managerIds.length ? { monthKey, managerIds } : { monthKey };
    }, [monthKey, managerIdsKey]);

    useEffect(() => {
        if (wanted) dispatch(fetchAiPlanFact(wanted));
    }, [dispatch, wanted]);

    const refresh = useCallback(() => {
        if (wanted) dispatch(fetchAiPlanFact(wanted, true));
    }, [dispatch, wanted]);

    const isCurrent =
        !!wanted &&
        query?.monthKey === wanted.monthKey &&
        (query?.managerIds ?? []).join(',') ===
            (wanted.managerIds ?? []).join(',');
    const status: AiStatus = isCurrent ? section.status : 'loading';
    const data: AiPlanFact | null =
        isCurrent && section.status === 'ready' ? section.data : null;

    return {
        status,
        data,
        error: isCurrent ? section.error : null,
        isLeader,
        /** Период фильтра задан — есть месяц реконсиляции. */
        hasScope: wanted !== null,
        monthKey,
        managerName,
        refresh,
        retry: refresh,
    };
};
