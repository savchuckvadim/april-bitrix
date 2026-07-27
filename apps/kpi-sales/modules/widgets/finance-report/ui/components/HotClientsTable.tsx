'use client';

import React, { useCallback, useState } from 'react';
import {
    Table as ShadcnTable,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { Button } from '@workspace/ui/components/button';
import { Card } from '@workspace/ui/components/card';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { type FinanceHotDeal } from '@/modules/entities/finance';
import { HotClientRow } from './HotClientRow';

/** Сколько строк рендерим за раз (инкрементально — не грузим DOM сотнями). */
const ROWS_BATCH_SIZE = 50;

interface HotClientsTableProps {
    deals: FinanceHotDeal[];
    /**
     * Скрыть колонку «Менеджер» — для user-scoped варианта (страница
     * пользователя: все сделки одного менеджера, колонка избыточна).
     */
    hideManager?: boolean;
}

/**
 * Таблица горячих сделок: мемо-строки (HotClientRow) + инкрементальный
 * рендер «Показать ещё» — сотни сделок не вешают браузер.
 */
export const HotClientsTable: React.FC<HotClientsTableProps> = ({
    deals,
    hideManager = false,
}) => {
    const domain = useAppSelector(state => state.app.domain);
    const departmentItems = useAppSelector(state => state.department.items);
    const [expanded, setExpanded] = useState<Set<number>>(new Set());
    const [visibleCount, setVisibleCount] = useState(ROWS_BATCH_SIZE);

    const toggle = useCallback((id: number) => {
        setExpanded(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    if (!deals.length) {
        return (
            <p className="py-4 text-sm text-muted-foreground">
                Открытых сделок на выбранной стадии нет
            </p>
        );
    }

    // Колонки: Компания / [Менеджер] / Стадия / Договор / Сумма / Месячная.
    const columnsCount = hideManager ? 5 : 6;
    const visibleDeals = deals.slice(0, visibleCount);

    return (
        <Card className="my-4 p-4 bg-popover text-primary">
            <ShadcnTable className="bg-popover text-primary">
                <TableHeader>
                    <TableRow>
                        <TableHead>Компания</TableHead>
                        {!hideManager && <TableHead>Менеджер</TableHead>}
                        <TableHead>Стадия</TableHead>
                        <TableHead>Договор</TableHead>
                        <TableHead className="text-right">Сумма</TableHead>
                        <TableHead className="text-right">Месячная</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {visibleDeals.map(deal => (
                        <HotClientRow
                            key={deal.id}
                            deal={deal}
                            domain={domain}
                            departmentItems={departmentItems}
                            hideManager={hideManager}
                            columnsCount={columnsCount}
                            isOpen={expanded.has(deal.id)}
                            onToggle={toggle}
                        />
                    ))}
                </TableBody>
            </ShadcnTable>
            {deals.length > visibleCount && (
                <div className="mt-3 flex justify-center">
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
        </Card>
    );
};
