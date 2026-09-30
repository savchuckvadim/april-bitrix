'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app';
import {
    aiToday,
    fetchAiForecast,
    selectAiIsLeader,
    selectAiRequester,
} from '@/modules/entities/ai-analytics';
import {
    buildAiForecastView,
    type AiForecastView,
} from '../lib/ai-forecast.util';

/**
 * Карточка «Прогноз отдела» (Фаза 4): только руководителю — остальным
 * запрос не шлём (сервер ответил бы 403), карточка не рендерится. Запрос
 * при смене руководителя/пользователя (гард ключа в thunk не даст дублей),
 * «Обновить» и «Повторить» — с force. view — готовый вид карточки.
 */
export const useAiForecast = () => {
    const dispatch = useAppDispatch();
    const isLeader = useAppSelector(selectAiIsLeader);
    const requesterId = useAppSelector(
        state => selectAiRequester(state)?.requesterUserId ?? null,
    );
    const section = useAppSelector(state => state.aiAnalytics.forecast);

    useEffect(() => {
        if (isLeader && requesterId) void dispatch(fetchAiForecast());
    }, [dispatch, isLeader, requesterId]);

    const refresh = useCallback(() => {
        void dispatch(fetchAiForecast(true));
    }, [dispatch]);

    const data = section.status === 'ready' ? section.data : null;
    const today = aiToday();
    const view = useMemo<AiForecastView | null>(
        () => (data ? buildAiForecastView(data, today) : null),
        [data, today],
    );

    return {
        isLeader,
        status: section.status,
        error: section.error,
        view,
        refresh,
        retry: refresh,
    };
};
