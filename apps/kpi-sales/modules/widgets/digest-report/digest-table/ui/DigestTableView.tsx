'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import {
    DIGEST_METRIC_BY_CODE,
    DIGEST_TABLE_METRICS,
    type DigestMetricValues,
    type DigestRow,
} from '@/modules/entities/digest';
import type { NameMap } from '../../lib/catalog-names.util';
import type { DigestSort, DigestSortKey } from '../lib/digest-table.util';
import { DigestMetricCell } from './DigestMetricCell';
import { DigestTableHead } from './DigestTableHead';
import { DigestTableRow } from './DigestTableRow';

interface DigestTableViewProps {
    rows: DigestRow[];
    totals: DigestMetricValues;
    sort: DigestSort;
    onSort: (key: DigestSortKey) => void;
    names: { types: NameMap; reasons: NameMap };
    focusUserId: number | null;
    onFocus: (userId: number) => void;
}

/** Таблица сотрудник × метрики с итоговой строкой. */
export const DigestTableView = ({
    rows,
    totals,
    sort,
    onSort,
    names,
    focusUserId,
    onFocus,
}: DigestTableViewProps) => (
    <div className="overflow-x-auto">
        <Table className="text-sm">
            <TableHeader>
                <TableRow>
                    <DigestTableHead
                        sortKey="name"
                        label="Сотрудник"
                        sort={sort}
                        onSort={onSort}
                        align="left"
                    />
                    {DIGEST_TABLE_METRICS.map(code => (
                        <DigestTableHead
                            key={code}
                            sortKey={code}
                            label={DIGEST_METRIC_BY_CODE[code].short}
                            hint={DIGEST_METRIC_BY_CODE[code].hint}
                            sort={sort}
                            onSort={onSort}
                        />
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {rows.map(row => (
                    <DigestTableRow
                        key={row.userId}
                        row={row}
                        names={names}
                        focused={focusUserId === row.userId}
                        onFocus={onFocus}
                    />
                ))}
                {rows.length > 1 && (
                    <TableRow className="border-t-2">
                        <TableCell className="font-semibold">Итого</TableCell>
                        {DIGEST_TABLE_METRICS.map(code => (
                            <DigestMetricCell key={code} code={code} value={totals[code]} bold />
                        ))}
                    </TableRow>
                )}
            </TableBody>
        </Table>
    </div>
);
