'use client';

import { useMemo } from 'react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { getTaskLinks } from '@/modules/entities/EventTask/lib/task-links';
import {
    TaskPrimaryContext,
    resolveTaskPrimaryContext,
} from '@/modules/entities/EventTask/lib/task-primary-context';

/**
 * Связи текущей задачи: приоритетная сущность и «остальные» — для бледного
 * счётчика в шапке события. Чистая производная от store, без запросов.
 */
export const useTaskRelatedLinks = (): TaskPrimaryContext => {
    const currentTask = useAppSelector(s => s.eventTask.current);
    return useMemo(
        () => resolveTaskPrimaryContext(getTaskLinks(currentTask)),
        [currentTask],
    );
};
