'use client';

import React from 'react';
import { HintTooltip } from '@workspace/april-ui';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    FINANCE_PERIOD_CAPTION_HINT,
    formatFinancePeriodCaption,
} from '@/modules/entities/finance';
import { FinanceSalesSummary } from '@/modules/feature/finance-summary';
import { useUserFinanceSummary } from './hooks/use-user-finance-summary';

interface UserFinanceSummaryProps {
    userId: number;
}

/**
 * Сводка «Продажи» менеджера — тот же FinanceSalesSummary, что и в
 * командном отчёте, на user-totals (логика в useUserFinanceSummary). Над
 * плитками — период расчёта «за ДД.ММ–ДД.ММ, по дате закрытия сделки»,
 * чтобы сравнение с вкладкой AI шло за одинаковое окно.
 */
export const UserFinanceSummary: React.FC<UserFinanceSummaryProps> = ({
    userId,
}) => {
    const { loading, totals, comparisonTotals } =
        useUserFinanceSummary(userId);
    const from = useAppSelector(state => state.report.date.from);
    const to = useAppSelector(state => state.report.date.to);

    if (loading) {
        return (
            <p className="text-sm text-muted-foreground">Считаем финансы…</p>
        );
    }

    return (
        <div className="space-y-2">
            <HintTooltip
                title={FINANCE_PERIOD_CAPTION_HINT.title}
                lines={[...FINANCE_PERIOD_CAPTION_HINT.lines]}
            >
                <p className="w-fit cursor-help border-b border-dashed border-muted-foreground/60 text-xs text-muted-foreground">
                    {formatFinancePeriodCaption(from, to)}
                </p>
            </HintTooltip>
            <FinanceSalesSummary
                totals={totals}
                comparisonTotals={comparisonTotals}
            />
        </div>
    );
};
