'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app';
import {
    fetchAiAttention,
    fetchAiBrief,
    fetchAiByType,
    fetchAiOverview,
    fetchAiTypesMatrix,
} from '@/modules/entities/ai-analytics';
import { departmentActions } from '@/modules/entities/department';
import { reportActions, ReportDateType } from '@/modules/entities/report';
import { ensureReportData } from '@/modules/feature/report-flow';

/**
 * Действия пустого состояния матриц над глобальным фильтром: «Показать с
 * даты» (начало периода) и «Добавить в фильтр» (пилотных сотрудников).
 * После смены — перезапрос секций AI, зависящих от периода и состава (как
 * listener фильтра). События и звонки отчёта вкладке «AI аналитика» не
 * нужны: ensureReportData запросит их, только если они заявлены вне вкладки,
 * а по новому фильтру они догрузятся при переходе на вкладку отчёта.
 */
export const useAiMatrixFilterActions = () => {
    const dispatch = useAppDispatch();
    const items = useAppSelector(state => state.department.items);
    const current = useAppSelector(state => state.department.current);
    const briefIdle = useAppSelector(
        state => state.aiAnalytics.brief.status === 'idle',
    );
    const byTypeIdle = useAppSelector(
        state => state.aiAnalytics.byType.status === 'idle',
    );

    const refetch = useCallback(() => {
        dispatch(ensureReportData());
        void dispatch(fetchAiOverview());
        void dispatch(fetchAiAttention());
        void dispatch(fetchAiTypesMatrix());
        if (!briefIdle) void dispatch(fetchAiBrief());
        if (!byTypeIdle) void dispatch(fetchAiByType());
    }, [dispatch, briefIdle, byTypeIdle]);

    const showFrom = useCallback(
        (date: string) => {
            dispatch(
                reportActions.setChangedDate({
                    typeOfDate: ReportDateType.FROM,
                    value: date,
                }),
            );
            refetch();
        },
        [dispatch, refetch],
    );

    const addToFilter = useCallback(
        (managerIds: readonly string[]) => {
            const selected = new Set(current.map(user => Number(user.ID)));
            const toAdd = items.filter(
                user =>
                    managerIds.includes(String(user.ID)) &&
                    !selected.has(Number(user.ID)),
            );
            if (!toAdd.length) return;
            dispatch(departmentActions.setDepartmentCurrent([...current, ...toAdd]));
            refetch();
        },
        [dispatch, items, current, refetch],
    );

    return { showFrom, addToFilter };
};
