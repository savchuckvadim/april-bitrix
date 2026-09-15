'use client';

import { useMemo } from 'react';
import { useAppSelector } from '@/modules/app';
import {
    groupAiRows,
    type AiManagerRow,
} from '@/modules/entities/ai-analytics';

/**
 * Секции таблицы сигналов по структуре отделов (группы → отделы → плоско),
 * как в остальных таблицах отчёта; менеджеры вне структуры — отдельно.
 */
export const useAiOverviewGroups = (rows: AiManagerRow[]) => {
    const departments = useAppSelector(state => state.department.departments);
    const isMulti = useAppSelector(state => state.department.isMulti);
    return useMemo(
        () => groupAiRows(rows, departments, isMulti),
        [rows, departments, isMulti],
    );
};
