'use client';

import { useMemo } from 'react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { getTaskLinks } from '@/modules/entities/EventTask/lib/task-links';
import { pickPanelLeadId } from '../lead-request-view';

/**
 * Лид для панели заявки на экране клиента (доска и вкладка «инфо»).
 *
 * Из связей клиента, когда они загружены; иначе — из привязок дел, которые
 * уже лежат в сторе вместе со списком дел. Отдельного запроса хук не
 * делает: связи клиента грузятся по требованию (см. useEnsureRelations).
 */
export const usePanelLeadId = (): number | undefined => {
    const relatedLeads = useAppSelector(s => s.relatedCrm.details?.leads);
    const tasks = useAppSelector(s => s.eventTask.tasks);

    const taskLeadIds = useMemo(
        () => (tasks ?? []).flatMap(task => getTaskLinks(task).leadIds),
        [tasks],
    );

    return pickPanelLeadId(relatedLeads, taskLeadIds);
};
