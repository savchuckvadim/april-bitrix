'use client';

import { useMemo } from 'react';
import { useDigestData } from '../../lib/digest-data.context';
import { buildSalesTiles } from '../lib/sales-view.util';

/** Продажи дня по выборке: сделки, плитки, имена сотрудников. */
export const useDigestSales = () => {
    const { report, rows, domain } = useDigestData();
    const sales = useMemo(() => report.presentations?.sales ?? [], [report.presentations]);
    const names = useMemo(() => new Map(rows.map(row => [row.userId, row.name])), [rows]);
    return {
        available: report.presentations !== null,
        sales,
        tiles: buildSalesTiles(sales),
        presentUserIds: [...new Set(sales.map(sale => sale.assignedId))],
        nameOf: (userId: number) => names.get(userId) ?? `#${userId}`,
        domain,
    };
};
