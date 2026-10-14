'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { hourLabel, type HourBucket } from '@/modules/entities/digest';
import type { TimelineSeries } from '../lib/timeline-series';

interface DigestHourlyTableProps {
    buckets: HourBucket[];
    series: TimelineSeries[];
}

const cell = (value: number | undefined): string =>
    !value ? '' : Number.isInteger(value) ? String(value) : value.toFixed(1);

/** Те же почасовые корзины таблицей: час × серия. */
export const DigestHourlyTable = ({ buckets, series }: DigestHourlyTableProps) => (
    <div className="overflow-x-auto">
        <Table className="text-xs">
            <TableHeader>
                <TableRow>
                    <TableHead className="w-16">Час</TableHead>
                    {series.map(item => (
                        <TableHead key={item.key} className="text-right">
                            <span
                                className="mr-1 inline-block h-2 w-2 rounded-sm align-middle"
                                style={{ backgroundColor: item.color }}
                            />
                            {item.label}
                        </TableHead>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {buckets.map(bucket => (
                    <TableRow key={bucket.hour}>
                        <TableCell className="font-medium">{hourLabel(bucket.hour)}</TableCell>
                        {series.map(item => (
                            <TableCell key={item.key} className="text-right tabular-nums">
                                {cell(bucket.values[item.key])}
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
);
