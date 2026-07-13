'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePortal } from '@/modules/entities/portal/hooks';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import { Button } from '@workspace/ui/components/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { Badge } from '@workspace/ui/components/badge';
import {
    usePortalMeasures,
    usePortalMeasuresMonitoring,
    useSyncPortalMeasures,
} from '../../lib/hooks';
import { PORTAL_MEASURE_COLUMNS, type PortalMeasure } from '../../model';

/** Отрисовка значения ячейки с учётом пустых значений. */
function renderCell(value: PortalMeasure[keyof PortalMeasure]) {
    if (value === null || value === undefined || value === '') {
        return <span className="text-muted-foreground">—</span>;
    }
    return String(value);
}

/**
 * Панель портальных единиц измерения: синхронизация с глобальным справочником,
 * сводка PortalDB ↔ Bitrix и список `portal_measure`. Портал определяется по
 * `domain` (резолвится из `portalId`).
 */
export function PortalMeasuresPanel({ portalId }: { portalId: number }) {
    const portal = usePortal(portalId);
    const domain = portal.data?.domain;

    const measures = usePortalMeasures(domain);
    const monitoring = usePortalMeasuresMonitoring(domain);
    const sync = useSyncPortalMeasures();
    const [notice, setNotice] = React.useState<string | null>(null);

    if (!portal.isLoading && !domain) {
        return (
            <p className="text-sm text-destructive">
                У портала не задан domain — операции недоступны.
            </p>
        );
    }

    const onSync = () => {
        if (!domain) return;
        setNotice(null);
        sync.mutate(domain, {
            onSuccess: (res) =>
                setNotice(
                    `Синхронизация завершена: создано ${res.created}, обновлено ${res.updated}, всего ${res.total}.`,
                ),
            onError: (e) => setNotice(getApiErrorMessage(e)),
        });
    };

    const data = monitoring.data;

    return (
        <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">Единицы измерения портала</h1>
                    <p className="text-sm text-muted-foreground">
                        Портал: {domain ?? '…'}
                    </p>
                </div>
                <Button onClick={onSync} disabled={sync.isPending || !domain}>
                    {sync.isPending ? 'Синхронизация…' : 'Синхронизировать с глобальными'}
                </Button>
            </div>
            {notice && <p className="text-xs text-amber-600">{notice}</p>}

            <Card>
                <CardHeader>
                    <CardTitle>Сводка: PortalDB ↔ Bitrix</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {monitoring.isLoading ? (
                        <p className="text-sm text-muted-foreground">Загрузка…</p>
                    ) : !data ? (
                        <p className="text-sm text-muted-foreground">Нет данных.</p>
                    ) : (
                        <div className="overflow-x-auto rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Ключ (bitrixId)</TableHead>
                                        <TableHead>PortalDB</TableHead>
                                        <TableHead>Bitrix</TableHead>
                                        <TableHead className="w-32">Статус</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.mergedMeasures.map((m) => (
                                        <TableRow key={m.key}>
                                            <TableCell className="font-mono text-xs">
                                                {m.key}
                                            </TableCell>
                                            <TableCell>
                                                {m.portal
                                                    ? m.portal.name ||
                                                      m.portal.fullName ||
                                                      `#${m.portal.id}`
                                                    : '—'}
                                            </TableCell>
                                            <TableCell>
                                                {m.bitrix
                                                    ? `${m.bitrix.title} (${m.bitrix.symbol})`
                                                    : '—'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        m.portal && m.bitrix
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {m.portal && m.bitrix
                                                        ? 'синхр.'
                                                        : m.portal
                                                          ? 'только DB'
                                                          : 'только Bitrix'}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {data.mergedMeasures.length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                className="text-sm text-muted-foreground"
                                            >
                                                Нет сопоставленных единиц.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                    {data && (
                        <div className="flex flex-wrap gap-2 pt-1 text-xs text-muted-foreground">
                            <Badge variant="outline">
                                PortalDB без пары: {data.portalMeasuresWithoutMerged.length}
                            </Badge>
                            <Badge variant="outline">
                                Bitrix без пары: {data.bitrixMeasuresWithoutMerged.length}
                            </Badge>
                            <Badge variant="outline">
                                Глобальный справочник: {data.globalMeasures.length}
                            </Badge>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Список portal_measure</CardTitle>
                </CardHeader>
                <CardContent>
                    {measures.isLoading ? (
                        <p className="text-sm text-muted-foreground">Загрузка…</p>
                    ) : (measures.data ?? []).length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Единицы измерения портала не найдены — запустите синхронизацию.
                        </p>
                    ) : (
                        <div className="overflow-x-auto rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {PORTAL_MEASURE_COLUMNS.map((col) => (
                                            <TableHead key={col.key}>{col.label}</TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(measures.data ?? []).map((row) => (
                                        <TableRow
                                            key={row.id}
                                            className="cursor-pointer hover:bg-accent"
                                        >
                                            {PORTAL_MEASURE_COLUMNS.map((col, ci) => (
                                                <TableCell key={col.key} className="p-0">
                                                    <Link
                                                        href={`/portal/${portalId}/konstructor/measure/${row.id}`}
                                                        className="block px-4 py-2"
                                                    >
                                                        {ci === 0 ? (
                                                            <span className="text-primary underline">
                                                                {renderCell(row[col.key])}
                                                            </span>
                                                        ) : (
                                                            renderCell(row[col.key])
                                                        )}
                                                    </Link>
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
