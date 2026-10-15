'use client';

import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import type { DigestSale } from '@/modules/entities/digest';
import { SaleRow } from './SaleRow';

interface SalesTableProps {
    sales: DigestSale[];
    nameOf: (userId: number) => string;
    domain: string;
}

/** Продажи дня таблицей. */
export const SalesTable = ({ sales, nameOf, domain }: SalesTableProps) => {
    if (!sales.length) {
        return <p className="py-3 text-sm text-muted-foreground">Продаж нет</p>;
    }
    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="text-xs">
                        <TableHead>Сделка</TableHead>
                        <TableHead>Сотрудник</TableHead>
                        <TableHead>Клиент</TableHead>
                        <TableHead>Комплект</TableHead>
                        <TableHead className="text-right">Сумма</TableHead>
                        <TableHead>Презентации</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sales.map(sale => (
                        <SaleRow key={sale.dealId} sale={sale} nameOf={nameOf} domain={domain} />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};
