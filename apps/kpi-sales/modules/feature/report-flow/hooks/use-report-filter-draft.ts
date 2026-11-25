'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import type {
    EReportDateMode,
    FilterInnerCode,
    ReportDateType,
} from '@/modules/entities/report/model/types/report/report-type';
import { isActionsFilterVisibleOnTab } from '../lib/report-filter-sections.util';
import { reportFilterDraftActions } from '../model/filter-draft/report-filter-draft.slice';

/**
 * Черновик фильтра отчёта для панели фильтров: значения черновика и
 * обработчики правки. Действующий фильтр (state.report, state.department)
 * они не трогают — в него черновик переходит только по «Применить»
 * (useReportFlow().applyFilter).
 */
export const useReportFilterDraft = () => {
    const dispatch = useAppDispatch();
    const draft = useAppSelector(state => state.reportFilterDraft);
    const actionItems = useAppSelector(state => state.report.actions.items);
    const isActionsVisibleOnTab = useAppSelector(state =>
        isActionsFilterVisibleOnTab(state.reportType.current),
    );

    const changeDate = useCallback(
        (typeOfDate: ReportDateType, value: string) => {
            dispatch(reportFilterDraftActions.dateChanged({ typeOfDate, value }));
        },
        [dispatch],
    );
    const changeDateMode = useCallback(
        (mode: EReportDateMode) => {
            dispatch(reportFilterDraftActions.dateModeChanged({ mode }));
        },
        [dispatch],
    );
    const changeUsers = useCallback(
        (userIds: number[]) => {
            dispatch(reportFilterDraftActions.usersChanged(userIds));
        },
        [dispatch],
    );
    const toggleAction = useCallback(
        (code: FilterInnerCode) => {
            dispatch(reportFilterDraftActions.actionToggled(code));
        },
        [dispatch],
    );

    return {
        date: draft.date,
        userIds: draft.userIds,
        actionCodes: draft.actionCodes,
        /** Все действия, из которых можно выбирать (их даёт отчёт). */
        actionItems,
        /**
         * Показывается ли раздел «Действия» на текущей вкладке: на «Звонках»,
         * «Дайджесте», «Финансах» и «AI аналитике» выбор действий ни на что не
         * влияет. Скрытый раздел черновик не меняет — выбор при «Применить»
         * и «Сохранить фильтр» остаётся прежним.
         */
        isActionsVisibleOnTab,
        changeDate,
        changeDateMode,
        changeUsers,
        toggleAction,
    };
};
