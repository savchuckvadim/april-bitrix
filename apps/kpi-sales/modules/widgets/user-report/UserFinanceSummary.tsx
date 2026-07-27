'use client';

import React from 'react';
import { FinanceSalesSummary } from '@/modules/feature/finance-summary';
import { useUserFinanceSummary } from './hooks/use-user-finance-summary';

interface UserFinanceSummaryProps {
    userId: number;
}

/**
 * Сводка «Продажи» менеджера — тот же FinanceSalesSummary, что и в
 * командном отчёте, на user-totals (логика в useUserFinanceSummary).
 */
export const UserFinanceSummary: React.FC<UserFinanceSummaryProps> = ({
    userId,
}) => {
    const { loading, totals, comparisonTotals } =
        useUserFinanceSummary(userId);

    if (loading) {
        return (
            <p className="text-sm text-muted-foreground">Считаем финансы…</p>
        );
    }

    return (
        <FinanceSalesSummary
            totals={totals}
            comparisonTotals={comparisonTotals}
        />
    );
};
