'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app';
import {
    aiToday,
    fetchAiDailyPlan,
    selectAiIsLeader,
    selectAiRequester,
    type AiDailyPlan,
    type AiStatus,
} from '@/modules/entities/ai-analytics';
import { useAiManagerName } from './use-ai-manager-name';
import {
    buildAiPlanManagerOptions,
    isAiPlanDate,
    pickAiPlanManager,
} from '../lib/ai-daily-plan.util';

/**
 * Состояние карточки «План дня»: чей план (руководителю — селект из
 * менеджеров периметра по строкам обзора, менеджеру — свой id), на какой
 * день (по умолчанию сегодня), гейт настройки портала dailyPlanEnabled,
 * запрос при смене входов (гарды thunk не дадут дублей) и «Обновить» с
 * force. Пока в сторе ответ на другой запрос (сменили менеджера или день)
 * — секция показывается как loading, а не чужими данными.
 */
export const useAiDailyPlan = (defaultManagerId?: string) => {
    const dispatch = useAppDispatch();
    const section = useAppSelector(state => state.aiAnalytics.dailyPlan);
    const query = useAppSelector(state => state.aiAnalytics.dailyPlanQuery);
    const isLeader = useAppSelector(selectAiIsLeader);
    const requesterId = useAppSelector(
        state => selectAiRequester(state)?.requesterUserId ?? null,
    );
    const overviewManagers = useAppSelector(
        state => state.aiAnalytics.overview.data?.managers,
    );
    const disabled = useAppSelector(
        state => state.aiAnalytics.settings.data?.dailyPlanEnabled === false,
    );
    const managerName = useAiManagerName();

    const [selectedManagerId, setSelectedManagerId] = useState<string | null>(
        null,
    );
    const [date, setDate] = useState(aiToday);

    const options = useMemo(
        () =>
            buildAiPlanManagerOptions(
                (overviewManagers ?? []).map(row => row.managerId),
                managerName,
            ),
        [overviewManagers, managerName],
    );
    const managerId = isLeader
        ? pickAiPlanManager(options, [
              selectedManagerId,
              defaultManagerId,
              requesterId,
          ])
        : requesterId;
    const dateValid = isAiPlanDate(date);
    const canQuery = !disabled && !!managerId && dateValid;

    useEffect(() => {
        if (!canQuery || !managerId) return;
        dispatch(fetchAiDailyPlan({ managerId, date }));
    }, [dispatch, canQuery, managerId, date]);

    const refresh = useCallback(() => {
        if (!canQuery || !managerId) return;
        dispatch(fetchAiDailyPlan({ managerId, date }, true));
    }, [dispatch, canQuery, managerId, date]);

    // Ответ в сторе относится к текущим входам? Иначе ждём свой запрос.
    const isCurrent = query?.managerId === managerId && query?.date === date;
    const status: AiStatus = isCurrent ? section.status : 'loading';
    const data: AiDailyPlan | null =
        isCurrent && section.status === 'ready' ? section.data : null;

    return {
        status,
        data,
        error: isCurrent ? section.error : null,
        isLeader,
        /** План дня выключен настройкой портала — запрос не шлём. */
        disabled,
        options,
        managerId,
        selectManager: setSelectedManagerId,
        date,
        setDate,
        dateValid,
        /** Руководитель, а обзор ещё не посчитан — список менеджеров пуст. */
        overviewPending: isLeader && !overviewManagers,
        managerName,
        refresh,
    };
};
