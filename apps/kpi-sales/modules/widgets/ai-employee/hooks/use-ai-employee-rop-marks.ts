'use client';

import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app';
import { fetchAiRopMarkWeek } from '@/modules/entities/ai-analytics';
import { aiEmployeeRopMarkCalls } from '../lib/ai-employee-feedback.util';

/**
 * Отметки руководителя по звонкам недели для сотрудника: секция ropMark
 * (rop-mark/list; при пустом подборе thunk сам делает pick) — только
 * руководителю: не руководителю запрос не шлём (сервер ответил бы 403).
 * Звонки фильтруются по сотруднику.
 */
export const useAiEmployeeRopMarks = (
    managerId: string,
    isLeader: boolean,
    enabled: boolean,
) => {
    const dispatch = useAppDispatch();
    const section = useAppSelector(state => state.aiAnalytics.ropMark);

    useEffect(() => {
        if (enabled && isLeader && section.status === 'idle') {
            void dispatch(fetchAiRopMarkWeek());
        }
    }, [dispatch, enabled, isLeader, section.status]);

    const calls = useMemo(
        () => aiEmployeeRopMarkCalls(section.data, managerId),
        [section.data, managerId],
    );

    return {
        status: section.status,
        error: section.error,
        week: section.data,
        calls,
    };
};
