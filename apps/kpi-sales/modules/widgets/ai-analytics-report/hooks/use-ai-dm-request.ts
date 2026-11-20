'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppSelector } from '@/modules/app';
import {
    selectAiRequester,
    type AiRequester,
    type AiStatus,
} from '@/modules/entities/ai-analytics';
import { aiDmLoadError } from '../lib/deal-movement/ai-deal-movement-query.util';

/*
 * Загрузка ручки «Движения сделок» в состояние подвкладки: запрос — по
 * смене тела, ответ устаревшего запроса отбрасывается, пока грузится
 * следующая страница — прежние данные остаются на экране. Стор отчёта не
 * трогается: данные нужны только этой подвкладке.
 */

export interface AiDmRequest<Q> {
    requester: AiRequester;
    query: Q;
}

export interface AiDmRequestState<T> {
    status: AiStatus;
    data: T | null;
    error: string | null;
    /** 403: раздел только руководителям — повтор не поможет. */
    forbidden: boolean;
}

const IDLE = { status: 'idle', data: null, error: null, forbidden: false } as const;

/** Кто спрашивает — один объект, пока не сменились портал и пользователь. */
export const useAiDmRequester = (): AiRequester | null => {
    const domain = useAppSelector(state => selectAiRequester(state)?.domain ?? null);
    const requesterUserId = useAppSelector(
        state => selectAiRequester(state)?.requesterUserId ?? null,
    );
    return useMemo(
        () => (domain && requesterUserId ? { domain, requesterUserId } : null),
        [domain, requesterUserId],
    );
};

/**
 * @param request тело запроса (мемоизированное); null — не спрашивать
 * @param load ручка — стабильная функция модуля
 */
export const useAiDmRequest = <Q, T>(
    request: AiDmRequest<Q> | null,
    load: (requester: AiRequester, query: Q) => Promise<T>,
) => {
    const [state, setState] = useState<AiDmRequestState<T>>(IDLE);
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        if (!request) return;
        let alive = true;
        setState(prev => ({ ...prev, status: 'loading', error: null }));
        load(request.requester, request.query).then(
            data => {
                if (alive) setState({ status: 'ready', data, error: null, forbidden: false });
            },
            (error: unknown) => {
                if (alive) setState({ status: 'error', data: null, ...aiDmLoadError(error) });
            },
        );
        return () => {
            alive = false;
        };
    }, [request, load, attempt]);

    const retry = useCallback(() => setAttempt(value => value + 1), []);

    return { ...state, retry };
};
