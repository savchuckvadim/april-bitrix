'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    emptyClosedTotals,
    getUserClosedSales,
    type FinanceClosedTotals,
} from '@/modules/entities/finance';

export interface UserFinanceSummaryData {
    loading: boolean;
    totals: FinanceClosedTotals;
    comparisonTotals: FinanceClosedTotals | null;
}

/**
 * Финансовая сводка менеджера (закрытые сделки): грузит его продажи и
 * отдаёт готовые totals + totals периода сравнения. Перезагрузка при
 * смене периода/режима сравнения.
 */
export const useUserFinanceSummary = (
    userId: number,
): UserFinanceSummaryData => {
    const dispatch = useAppDispatch();
    const initialized = useAppSelector(state => state.app.initialized);
    const from = useAppSelector(state => state.report.date.from);
    const to = useAppSelector(state => state.report.date.to);
    const comparisonMode = useAppSelector(
        state => state.finance.comparison.mode,
    );
    const { status, report, comparisonReport } = useAppSelector(
        state => state.finance.userFinance,
    );

    useEffect(() => {
        if (initialized && from && to) {
            dispatch(getUserClosedSales(userId));
        }
    }, [dispatch, initialized, userId, from, to, comparisonMode]);

    return {
        loading: status === 'loading' || status === 'idle',
        totals: report?.totals ?? emptyClosedTotals(),
        comparisonTotals:
            comparisonMode !== 'off'
                ? (comparisonReport?.totals ?? null)
                : null,
    };
};
