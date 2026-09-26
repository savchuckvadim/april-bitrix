'use client';

import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app';
import {
    fetchAiDossier,
    type AiDossier,
    type AiStatus,
} from '@/modules/entities/ai-analytics';

/**
 * Досье менеджера для диалога: запрос при открытии и смене менеджера /
 * окна (гард thunk не даст дублей; queued/processing дожидается WS),
 * «Пересобрать» — force. Секция dossier в сторе одна на всех менеджеров:
 * данные отдаём, только если запомненный запрос совпадает с нашим.
 */
export const useAiDossier = (
    managerId: string,
    months: number,
    open: boolean,
) => {
    const dispatch = useAppDispatch();
    const section = useAppSelector(state => state.aiAnalytics.dossier);
    const query = useAppSelector(state => state.aiAnalytics.dossierQuery);

    useEffect(() => {
        if (open && managerId) {
            void dispatch(fetchAiDossier({ managerId, months }));
        }
    }, [dispatch, open, managerId, months]);

    const rebuild = useCallback(
        () => dispatch(fetchAiDossier({ managerId, months }, { force: true })),
        [dispatch, managerId, months],
    );

    const isCurrent =
        !!query && query.managerId === managerId && query.months === months;
    const status: AiStatus = isCurrent ? section.status : 'loading';
    const data: AiDossier | null =
        isCurrent && section.status === 'ready' ? section.data : null;

    return {
        status,
        jobStatus: isCurrent ? section.jobStatus : null,
        data,
        error: isCurrent ? section.error : null,
        rebuild,
        retry: rebuild,
    };
};
