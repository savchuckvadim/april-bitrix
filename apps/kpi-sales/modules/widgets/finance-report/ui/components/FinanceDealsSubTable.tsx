'use client';

import React, { useState } from 'react';
import {
    Table as ShadcnTable,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { Button } from '@workspace/ui/components/button';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { type FinanceClosedDeal } from '@/modules/entities/finance';
import { ClosedDealRow } from './ClosedDealRow';

/** Сколько строк рендерим за раз (инкрементально — не грузим DOM сотнями). */
const ROWS_BATCH_SIZE = 50;

interface FinanceDealsSubTableProps {
    deals: FinanceClosedDeal[];
}

/**
 * Детализация продаж сотрудника: мемо-строки (ClosedDealRow) +
 * инкрементальный рендер «Показать ещё» — годовые выборки не вешают
 * браузер.
 */
export const FinanceDealsSubTable: React.FC<FinanceDealsSubTableProps> = ({
    deals,
}) => {
    const domain = useAppSelector(state => state.app.domain);
    const [visibleCount, setVisibleCount] = useState(ROWS_BATCH_SIZE);
    if (!deals.length) return null;

    const visibleDeals = deals.slice(0, visibleCount);

    return (
        <div className="rounded-md border border-border bg-background-muted p-2">
            <ShadcnTable>
                <TableHeader>
                    <TableRow>
                        <TableHead>Компания</TableHead>
                        <TableHead>Закрыта</TableHead>
                        <TableHead>Договор</TableHead>
                        <TableHead className="text-right">Аванс</TableHead>
                        <TableHead className="text-right">Месячная</TableHead>
                        <TableHead className="text-right">Мес. договора</TableHead>
                        <TableHead className="text-right">Ожидаемая</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {visibleDeals.map(deal => (
                        <ClosedDealRow
                            key={`deal-${deal.id}`}
                            deal={deal}
                            domain={domain}
                        />
                    ))}
                </TableBody>
            </ShadcnTable>
            {deals.length > visibleCount && (
                <div className="mt-2 flex justify-center">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() =>
                            setVisibleCount(count => count + ROWS_BATCH_SIZE)
                        }
                    >
                        Показать ещё ({deals.length - visibleCount})
                    </Button>
                </div>
            )}
        </div>
    );
};
