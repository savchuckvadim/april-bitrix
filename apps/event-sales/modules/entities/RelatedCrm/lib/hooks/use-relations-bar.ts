'use client';

import { useMemo } from 'react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { selectWorkingUserId } from '@/modules/app/lib/utills/working-user';
import {
    buildRelationsBar,
    MAX_RELATION_BARS,
    type RelationsBarMode,
    type RelationsBarView,
} from '../relations-bar';
import { collectTaskBoundDeals } from '../task-bound-deals';
import { useContextDeal } from './use-context-deal';
import { useCurrentRelations } from './use-current-relations';

/**
 * Связи клиента для шапки: главная полоска и миниатюры остальных.
 *
 * Данные те же, что у полноэкранной карточки (общий `useCurrentRelations`),
 * поэтому лишнего запроса шапка не делает — ответ переиспользуется.
 *
 * Связи клиента грузятся ПО ТРЕБОВАНИЮ (история, контакты, пересечения),
 * а не на каждое открытие фрейма, поэтому первый источник здесь — сама
 * сделка плейсмента (useContextDeal): она уже в сторе, и главная полоска
 * видна сразу и без запросов. Связи, когда приедут, её дополнят.
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
    // В режиме руководителя «свои» — сделки сотрудника, за которого идёт
    // работа, а не руководителя.
    const currentUserId = useAppSelector(selectWorkingUserId);
    const contextDeal = useContextDeal();

    const boundDeals = useMemo(() => {
        const fromTasks = collectTaskBoundDeals(
            [currentTask, ...(tasks ?? [])],
            boundDealsById,
        );
        // Сделка плейсмента — впереди привязок задач; дубль по id не нужен.
        if (!contextDeal) return fromTasks;
        return [
            contextDeal,
            ...fromTasks.filter(deal => deal.id !== contextDeal.id),
        ];
    }, [currentTask, tasks, boundDealsById, contextDeal]);

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
