'use client';

import { useMemo } from 'react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    buildRelationsBar,
    MAX_RELATION_BARS,
    type RelationsBarMode,
    type RelationsBarView,
} from '../relations-bar';
import { collectTaskBoundDeals } from '../task-bound-deals';
import { useCurrentRelations } from './use-current-relations';

/**
 * Связи клиента для шапки: главная полоска и миниатюры остальных.
 *
 * Данные те же, что у полноэкранной карточки (общий `useCurrentRelations`),
 * поэтому лишнего запроса шапка не делает — ответ переиспользуется.
 *
 * Вторым источником — сделки привязок задач клиента (слайс taskDeals): у
 * лид-клиента без компании граф связей сделку «нового стиля» не видит, и без
 * привязок шапка оставалась пустой (todo2508-02 №1). Берутся привязки ВСЕХ
 * загруженных задач, а не только открытого дела: шапка живёт и на списке,
 * где текущего дела нет.
 */
export const useRelationsBar = (
    max = MAX_RELATION_BARS,
    mode: RelationsBarMode = 'all',
): RelationsBarView & { isLoading: boolean } => {
    const { details, descriptor, status } = useCurrentRelations();
    const tasks = useAppSelector(s => s.eventTask.tasks);
    const currentTask = useAppSelector(s => s.eventTask.current);
    const boundDealsById = useAppSelector(s => s.taskDeals.byId);
    // Пользователь фрейма — правило владения: автовыбор главной только
    // среди СВОИХ открытых сделок (deal-ownership).
    const currentUserId = useAppSelector(s => Number(s.app.bitrix.user?.ID) || null);

    const boundDeals = useMemo(
        () =>
            collectTaskBoundDeals(
                [currentTask, ...(tasks ?? [])],
                boundDealsById,
            ),
        [currentTask, tasks, boundDealsById],
    );

    const view = useMemo(
        () =>
            buildRelationsBar({
                deals: details?.deals,
                boundDeals,
                leads: details?.leads,
                currentDealId: descriptor?.currentDealId ?? null,
                currentUserId,
                currentDealClosed: descriptor?.currentDealClosed ?? null,
                max,
                mode,
            }),
        [
            details?.deals,
            details?.leads,
            boundDeals,
            descriptor?.currentDealId,
            descriptor?.currentDealClosed,
            currentUserId,
            max,
            mode,
        ],
    );

    return { ...view, isLoading: status === 'loading' };
};
