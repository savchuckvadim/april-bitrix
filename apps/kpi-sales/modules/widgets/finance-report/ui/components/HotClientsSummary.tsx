import React from 'react';
import { formatMoney, type FinanceHotTotals } from '@/modules/entities/finance';
import { HotTile } from './HotTile';

interface HotClientsSummaryProps {
    totals: FinanceHotTotals;
}

/**
 * Сводка горячих клиентов, пересчитанная из отфильтрованных сделок.
 * Потенциальный аванс = Σ товарных строк; потенциал в месяц = Σ месячных.
 */
export const HotClientsSummary: React.FC<HotClientsSummaryProps> = ({
    totals,
}) => (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <HotTile
            label="Сделок"
            value={totals.dealsCount.toLocaleString('ru-RU')}
        />
        <HotTile
            label="Сумма сделок"
            value={formatMoney(totals.opportunityTotal)}
        />
        <HotTile
            label="Потенциальный аванс"
            value={formatMoney(totals.productRowsAmountTotal)}
            accent="text-finance-advance"
        />
        <HotTile
            label="Потенциал в месяц"
            value={formatMoney(totals.monthlyAmountTotal)}
            accent="text-finance-monthly"
        />
    </div>
);
