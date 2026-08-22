'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { EV_PLAN_PROP } from '@/modules/entities/EventPlan';
import type { RelatedLead } from '@/modules/entities/RelatedCrm';
import { taskLeadLinksActions } from '../../model/TaskLeadLinksSlice';
import { buildTaskLeadLinksView, pickDefaultLeadIds } from '../task-lead-links';

export interface TaskLeadLinksData {
    /** Блок уместен: новая задача не унаследует лид и есть открытые. */
    visible: boolean;
    candidates: RelatedLead[];
    selectedIds: number[];
    /** Текущее дело есть, но заявка у него не указана — объясняем почему спрашиваем. */
    isCurrentTaskWithoutLead: boolean;
}

/**
 * Кандидаты блока «связать новую задачу с заявками». Правило показа —
 * чистая функция buildTaskLeadLinksView; хук только достаёт состояние и
 * отмечает кандидата по умолчанию, пока менеджер сам ничего не выбрал.
 */
export const useTaskLeadLinks = (): TaskLeadLinksData => {
    const dispatch = useAppDispatch();
    const currentTask = useAppSelector(s => s.eventTask.current);
    const planActive = useAppSelector(s => s.eventPlan[EV_PLAN_PROP.IS_ACTIVE]);
    const selectedIds = useAppSelector(s => s.taskLeadLinks.selectedIds);
    const isTouched = useAppSelector(s => s.taskLeadLinks.isTouched);
    const leads = useAppSelector(s => s.relatedCrm.details?.leads);

    const { visible, candidates } = buildTaskLeadLinksView({
        currentTask,
        planActive,
        leads,
    });

    // Ключ по id: пересчитываем предвыбор, только когда набор кандидатов
    // реально изменился, а не на каждый рендер блока.
    const candidateKey = candidates.map(lead => lead.id).join(',');
    useEffect(() => {
        if (!visible || isTouched) return;
        const defaults = pickDefaultLeadIds(candidates);
        if (defaults.length) {
            dispatch(taskLeadLinksActions.preselect(defaults));
        }
        // candidates пересобирается каждый рендер — следим за ключом.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible, isTouched, candidateKey, dispatch]);

    return {
        visible,
        candidates,
        selectedIds,
        isCurrentTaskWithoutLead: visible && Boolean(currentTask),
    };
};
