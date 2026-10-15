'use client';

import { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import type { DigestPresentation } from '@/modules/entities/digest';
import { PresHistoryRow } from './PresHistoryRow';

interface PresHistoryTableProps {
    items: DigestPresentation[];
    nameOf: (userId: number) => string;
    domain: string;
}

const PAGE = 100;

/** История презентаций дня таблицей; порции по 100 строк. */
export const PresHistoryTable = ({ items, nameOf, domain }: PresHistoryTableProps) => {
    const [count, setCount] = useState(PAGE);
    if (!items.length) {
        return <p className="py-3 text-sm text-muted-foreground">Презентаций под фильтры нет</p>;
    }
    return (
        <div className="space-y-2">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="text-xs">
                            <TableHead>Время</TableHead>
                            <TableHead>Сотрудник</TableHead>
                            <TableHead>Статус</TableHead>
                            <TableHead>Клиент</TableHead>
                            <TableHead>Сделка</TableHead>
                            <TableHead>Комплект</TableHead>
                            <TableHead>Комментарии</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.slice(0, count).map(item => (
                            <PresHistoryRow
                                key={item.dealId}
                                item={item}
                                employeeName={nameOf(item.assignedId)}
                                domain={domain}
                            />
                        ))}
                    </TableBody>
                </Table>
            </div>
            {items.length > count && (
                <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setCount(current => current + PAGE)}
                >
                    Показать ещё {Math.min(PAGE, items.length - count)}
                </Button>
            )}
        </div>
    );
};
