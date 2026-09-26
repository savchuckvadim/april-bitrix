'use client';

import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app';
import {
    fetchAiStyleProfile,
    type AiStatus,
    type AiStyleCard,
} from '@/modules/entities/ai-analytics';

/**
 * Карточка стиля для диалога: запрос manager/style при открытии и смене
 * менеджера/месяца (гард thunk'а не даст дублей), повтор с force.
 * Секция style в сторе одна на всех менеджеров — данные отдаём, только
 * если запомненный запрос совпадает с нашим; иначе показываем загрузку,
 * а не чужой профиль.
 */
export const useAiStyle = (
    managerId: string,
    month: string | undefined,
    open: boolean,
) => {
    const dispatch = useAppDispatch();
    const section = useAppSelector(state => state.aiAnalytics.style);
    const styleQuery = useAppSelector(state => state.aiAnalytics.styleQuery);

    useEffect(() => {
        if (open && managerId) {
            void dispatch(fetchAiStyleProfile({ managerId, month }));
        }
    }, [dispatch, open, managerId, month]);

    const retry = useCallback(
        () => dispatch(fetchAiStyleProfile({ managerId, month }, true)),
        [dispatch, managerId, month],
    );

    const isCurrent =
        !!styleQuery &&
        styleQuery.managerId === managerId &&
        styleQuery.month === month;
    const status: AiStatus = isCurrent ? section.status : 'loading';
    const data: AiStyleCard | null =
        isCurrent && section.status === 'ready' ? section.data : null;

    return {
        status,
        data,
        error: isCurrent ? section.error : null,
        retry,
    };
};
