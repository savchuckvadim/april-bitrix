'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { fetchDigest, isTodayIso } from '@/modules/entities/digest';

/** Период тихого автообновления сегодняшнего дайджеста. */
export const DIGEST_AUTO_REFRESH_MS = 5 * 60_000;

/**
 * Автообновление «под капотом»: пока открыт сегодняшний день, раз в 5 минут
 * уходит повторный POST без прелоадера (poll-режим thunk'а: данные на
 * экране остаются, свежий конверт заменяет их по готовности). Бэк сам
 * пересчитывает партиции «сегодня» по TTL 120 с, forceRefresh не нужен.
 * Скрытая вкладка браузера не обновляется; при возврате — обновление, если
 * с последнего прошло больше периода. Другие вкладки отчёта не затрагивает:
 * таймер живёт только пока смонтирован виджет дайджеста.
 */
export const useDigestAutoRefresh = () => {
    const dispatch = useAppDispatch();
    const date = useAppSelector(state => state.digest.date);
    const status = useAppSelector(state => state.digest.status);
    const isPublic = useAppSelector(state => state.app.isPublic);
    const lastRefreshRef = useRef<number>(Date.now());

    const enabled = !isPublic && isTodayIso(date) && status === 'ready';

    useEffect(() => {
        if (status === 'ready') lastRefreshRef.current = Date.now();
    }, [status]);

    useEffect(() => {
        if (!enabled) return;

        const refresh = () => {
            if (document.visibilityState !== 'visible') return;
            lastRefreshRef.current = Date.now();
            void dispatch(fetchDigest({ poll: true }));
        };
        const onVisible = () => {
            if (
                document.visibilityState === 'visible' &&
                Date.now() - lastRefreshRef.current >= DIGEST_AUTO_REFRESH_MS
            ) {
                refresh();
            }
        };

        const timer = setInterval(refresh, DIGEST_AUTO_REFRESH_MS);
        document.addEventListener('visibilitychange', onVisible);
        return () => {
            clearInterval(timer);
            document.removeEventListener('visibilitychange', onVisible);
        };
    }, [dispatch, enabled]);

    return { autoRefreshEnabled: enabled };
};
