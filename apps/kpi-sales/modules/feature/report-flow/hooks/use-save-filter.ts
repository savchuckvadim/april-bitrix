'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { saveFilter } from '../model/report-flow-thunks';

/** Сколько держим галочку «Сохранено» после успешного сохранения. */
const SAVED_BADGE_MS = 2000;

/**
 * Сохранение фильтра со статусом для кнопки: isSaving — из стора
 * (запрос в полёте), isSaved загорается только после успешного ответа
 * бэка и гаснет через 2 секунды; таймер чистится при размонтировании.
 */
export const useSaveFilter = () => {
    const dispatch = useAppDispatch();
    const isSaving = useAppSelector(state => state.report.isFilterLoading);
    const [isSaved, setIsSaved] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(
        () => () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        },
        [],
    );

    const save = useCallback(async () => {
        const ok = await dispatch(saveFilter());
        if (!ok) return;
        setIsSaved(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setIsSaved(false), SAVED_BADGE_MS);
    }, [dispatch]);

    return { isSaving, isSaved, save };
};
