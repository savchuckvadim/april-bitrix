'use client';

import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { EV_PLAN_PROP } from '@/modules/entities/EventPlan';
import {
    isLeadOpen,
    useCurrentRelations,
} from '@/modules/entities/RelatedCrm';
import type { RelatedLead } from '@/modules/entities/RelatedCrm';

export interface TaskLeadLinksData {
    /** Блок уместен: новая задача (текущей нет) и есть открытые лиды. */
    visible: boolean;
    candidates: RelatedLead[];
    selectedIds: number[];
}

/**
 * Кандидаты блока «связать новую задачу с заявками»: открытые связанные
 * лиды клиента. Блок уместен только когда ТЕКУЩЕЙ задачи нет (следующая
 * задача существующей цепочки наследует L_* сама — бэк) и создаётся новая.
 */
export const useTaskLeadLinks = (): TaskLeadLinksData => {
    const currentTask = useAppSelector(s => s.eventTask.current);
    const planActive = useAppSelector(
        s => s.eventPlan[EV_PLAN_PROP.IS_ACTIVE],
    );
    const selectedIds = useAppSelector(s => s.taskLeadLinks.selectedIds);

    const enabled = !currentTask && planActive;
    const { details } = useCurrentRelations(enabled);
    const candidates = enabled
        ? (details?.leads ?? []).filter(lead =>
              isLeadOpen(lead.statusSemanticId),
          )
        : [];

    return {
        visible: enabled && candidates.length > 0,
        candidates,
        selectedIds,
    };
};
