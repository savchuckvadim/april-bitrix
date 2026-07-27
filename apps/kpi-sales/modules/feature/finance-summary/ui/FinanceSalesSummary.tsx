'use client';

import React from 'react';
import { Card, CardContent } from '@workspace/ui/components/card';
import { cn } from '@workspace/ui/lib/utils';
import {
    deltaPercent,
    formatMoney,
    type FinanceClosedTotals,
} from '@/modules/entities/finance';
import { FINANCE_SALES_TILES } from '../lib/finance-sales-tiles';
import { FinanceDeltaBadge } from './FinanceDeltaBadge';

interface FinanceSalesSummaryProps {
    totals: FinanceClosedTotals;
    /** Итоги периода сравнения — включают дельты. */
    comparisonTotals?: FinanceClosedTotals | null;
    /** Подпись периода сравнения для тултипа. */
    comparisonLabel?: string;
}

/**
 * Плитки «Продажи» — единый финанс-виджет для командного отчёта и
 * user-report (два вызова, один компонент).
 */
export const FinanceSalesSummary: React.FC<FinanceSalesSummaryProps> = ({
    totals,
    comparisonTotals,
    comparisonLabel,
}) => (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {FINANCE_SALES_TILES.map(tile => {
            const value = tile.value(totals);
            return (
                <Card key={tile.id} className="bg-popover">
                    <CardContent className="p-4">
                        <p
                            className={cn(
                                'flex items-center gap-1 text-xs',
                                tile.accent,
                            )}
                        >
                            {tile.icon}
                            {tile.label}
                        </p>
                        <div className="mt-1 text-xl font-bold">
                            {tile.money
                                ? formatMoney(value)
                                : value.toLocaleString('ru-RU')}
                        </div>
                        {comparisonTotals && (
                            <div className="mt-1" title={comparisonLabel}>
                                <FinanceDeltaBadge
                                    delta={deltaPercent(
                                        value,
                                        tile.value(comparisonTotals),
                                    )}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
            );
        })}
    </div>
);
