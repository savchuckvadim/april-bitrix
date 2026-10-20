'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app';
import {
    aiToday,
    fetchAiDailyPlan,
    type AiDailyPlan,
    type AiStatus,
} from '@/modules/entities/ai-analytics';
import { buildAiDailyPlanView } from '@/modules/widgets/ai-analytics-report';

/**
 * План дня сотрудника на сегодня (plan/daily) для подвкладки «К цели»:
 * гейт настройки портала dailyPlanEnabled, запрос при смене сотрудника
 * (гард thunk не даст дублей), «Обновить» с force. Секция плана дня в
 * сторе одна: данные отдаём, только если запомненный запрос — наш.
 */
export const useAiEmployeeDailyPlan = (managerId: string, enabled: boolean) => {
    const dispatch = useAppDispatch();
    const section = useAppSelector(state => state.aiAnalytics.dailyPlan);
    const query = useAppSelector(state => state.aiAnalytics.dailyPlanQuery);
    const disabled = useAppSelector(
        state => state.aiAnalytics.settings.data?.dailyPlanEnabled === false,
    );
    const date = aiToday();

    useEffect(() => {
        if (!enabled || disabled) return;
        dispatch(fetchAiDailyPlan({ managerId, date }));
    }, [dispatch, enabled, disabled, managerId, date]);

    const refresh = useCallback(() => {
        if (!enabled || disabled) return;
        dispatch(fetchAiDailyPlan({ managerId, date }, true));
    }, [dispatch, enabled, disabled, managerId, date]);

    const isCurrent = query?.managerId === managerId && query?.date === date;
    const status: AiStatus = isCurrent ? section.status : 'loading';
    const data: AiDailyPlan | null =
        isCurrent && section.status === 'ready' ? section.data : null;
    const view = useMemo(() => (data ? buildAiDailyPlanView(data) : null), [data]);

    return {
        disabled,
        status,
        error: isCurrent ? section.error : null,
        data,
        view,
        refresh,
    };
};
