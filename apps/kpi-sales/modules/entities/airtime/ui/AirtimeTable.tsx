'use client';

import React from 'react';
import Link from 'next/link';
import {
    Table as ShadcnTable,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { Card } from '@workspace/ui/components/card';
import type { AirtimeUserRow } from '../model';
import { formatDurationClock } from '../lib/airtime-format.util';
import { useAppSelector, selectIsPublic } from '@/modules/app';

interface AirtimeTableProps {
    rows: AirtimeUserRow[];
}

/** Таблица эфирного времени: менеджеры × звонки/длительности + Итого. */
export const AirtimeTable: React.FC<AirtimeTableProps> = ({ rows }) => {
    // Публичный снимок: имена без ссылок на user-report.
    const isPublic = useAppSelector(selectIsPublic);
    if (!rows.length) return null;

    const total = rows.reduce(
        (acc, row) => ({
            calls: acc.calls + row.callsCount,
            seconds: acc.seconds + row.airtimeSeconds,
            inCount: acc.inCount + row.incoming.count,
            inSeconds: acc.inSeconds + row.incoming.seconds,
            outCount: acc.outCount + row.outgoing.count,
            outSeconds: acc.outSeconds + row.outgoing.seconds,
        }),
        {
            calls: 0,
            seconds: 0,
            inCount: 0,
            inSeconds: 0,
            outCount: 0,
            outSeconds: 0,
        },
    );

    return (
        <Card className="my-4 p-4 bg-popover text-primary">
            <ShadcnTable className="bg-popover text-primary">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[190px] bg-popover text-primary">
                            Менеджер
                        </TableHead>
                        <TableHead className="text-right">Звонков</TableHead>
                        <TableHead className="text-right">Эфир</TableHead>
                        <TableHead className="text-right">Входящие</TableHead>
                        <TableHead className="text-right">Исходящие</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map(row => (
                        <TableRow key={`airtime-${row.user.ID}`}>
                            <TableCell className="font-medium">
                                {isPublic ? (
                                    row.userName
                                ) : (
                                    <Link
                                        href={`/report/user?userId=${row.user.ID}`}
                                        className="text-primary hover:underline"
                                    >
                                        {row.userName}
                                    </Link>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                {row.callsCount}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                                {formatDurationClock(row.airtimeSeconds)}
                            </TableCell>
                            <TableCell className="text-right">
                                {row.incoming.count}
                                <div className="text-xs text-muted-foreground">
                                    {formatDurationClock(row.incoming.seconds)}
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                {row.outgoing.count}
                                <div className="text-xs text-muted-foreground">
                                    {formatDurationClock(row.outgoing.seconds)}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                    <TableRow className="border-t-2">
                        <TableCell className="font-semibold">Итого</TableCell>
                        <TableCell className="text-right font-semibold">
                            {total.calls}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                            {formatDurationClock(total.seconds)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                            {total.inCount}
                            <div className="text-xs text-muted-foreground">
                                {formatDurationClock(total.inSeconds)}
                            </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                            {total.outCount}
                            <div className="text-xs text-muted-foreground">
                                {formatDurationClock(total.outSeconds)}
                            </div>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </ShadcnTable>
        </Card>
    );
};
