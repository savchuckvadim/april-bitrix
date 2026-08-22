'use client';

import { useMemo } from 'react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { getCrmLinksFromRaw } from '@/modules/entities/EventTask/lib/task-links';

/**
 * Заявки/лиды текущего дела: лид контекста плюс привязки задачи (L_xxx).
 *
 * Именно привязки, а не граф клиента: это лиды, ради которых открыто ЭТО
 * дело, и лишнего запроса они не стоят — всё уже в состоянии. Первым идёт
 * лид контекста: с него начинается и карточка, и очередь подтверждений.
 */
export const useRequestLeadIds = (): number[] => {
    const contextLeadId = useAppSelector(s =>
        Number(s.app.bitrix.lead?.ID ?? 0),
    );
    const ufCrmTask = useAppSelector(s => s.eventTask.current?.ufCrmTask);

    return useMemo(() => {
        const taskLeadIds = getCrmLinksFromRaw(ufCrmTask).leadIds;
        return [
            ...new Set([contextLeadId, ...taskLeadIds].filter(id => id > 0)),
        ];
    }, [contextLeadId, ufCrmTask]);
};
