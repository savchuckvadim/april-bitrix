'use client';

import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app';
import {
    fetchAiAbout,
    type AiAbout,
    type AiAboutEndpoint,
    type AiStatus,
} from '@/modules/entities/ai-analytics';

export interface UseAiAboutResult {
    status: AiStatus;
    data: AiAbout | null;
    error: string | null;
    /** Перечитать блок, минуя кэш секции (после ошибки). */
    retry: () => void;
}

/**
 * «Как считаем» для ручки витрины: секция кэша `about[endpoint]` (пока её
 * нет — idle) и запрос при активации (`active` — диалог открыт). Thunk сам
 * не дублирует запрос, пока секция loading/ready.
 */
export const useAiAbout = (
    endpoint: AiAboutEndpoint,
    active: boolean,
): UseAiAboutResult => {
    const dispatch = useAppDispatch();
    const section = useAppSelector(state => state.aiAnalytics.about[endpoint]);
    const status: AiStatus = section?.status ?? 'idle';

    useEffect(() => {
        if (active && status === 'idle') dispatch(fetchAiAbout(endpoint));
    }, [active, status, endpoint, dispatch]);

    const retry = useCallback(
        () => dispatch(fetchAiAbout(endpoint, true)),
        [dispatch, endpoint],
    );

    return {
        status,
        data: section?.data ?? null,
        error: section?.error ?? null,
        retry,
    };
};
