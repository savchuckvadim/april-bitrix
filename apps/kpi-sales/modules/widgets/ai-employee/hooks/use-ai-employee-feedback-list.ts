'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app';
import {
    aiToday,
    fetchAiFeedbackList,
    type AiFeedbackList,
    type AiStatus,
} from '@/modules/entities/ai-analytics';
import {
    aiEmployeeFeedbackGroups,
    aiEmployeeFeedbackItems,
    aiEmployeeFeedbackPeriod,
} from '../lib/ai-employee-feedback.util';

/**
 * Список реакций по сотруднику (feedback/list) за период обзора, иначе за
 * текущий и два прошлых месяца. Запрос при смене входов (гард thunk не
 * даст дублей), повтор с force; секция одна — данные отдаём, только если
 * запомненный запрос совпадает с нашим.
 */
export const useAiEmployeeFeedbackList = (
    managerId: string,
    period: { from: string; to: string } | null,
    enabled: boolean,
) => {
    const dispatch = useAppDispatch();
    const section = useAppSelector(state => state.aiAnalytics.feedbackList);
    const query = useAppSelector(state => state.aiAnalytics.feedbackListQuery);
    const today = aiToday();
    const wanted = useMemo(
        () => ({ ...aiEmployeeFeedbackPeriod(period, today), managerId }),
        [period, today, managerId],
    );

    useEffect(() => {
        if (enabled) dispatch(fetchAiFeedbackList(wanted));
    }, [dispatch, enabled, wanted]);

    const retry = useCallback(
        () => dispatch(fetchAiFeedbackList(wanted, true)),
        [dispatch, wanted],
    );

    const isCurrent =
        query?.from === wanted.from &&
        query?.to === wanted.to &&
        query?.managerId === wanted.managerId;
    const status: AiStatus = isCurrent ? section.status : 'loading';
    const data: AiFeedbackList | null =
        isCurrent && section.status === 'ready' ? section.data : null;
    const groups = useMemo(() => aiEmployeeFeedbackGroups(data), [data]);
    const items = useMemo(() => aiEmployeeFeedbackItems(data), [data]);

    return {
        status,
        error: isCurrent ? section.error : null,
        data,
        groups,
        items: items.items,
        hidden: items.hidden,
        period: { from: wanted.from, to: wanted.to },
        retry,
    };
};
