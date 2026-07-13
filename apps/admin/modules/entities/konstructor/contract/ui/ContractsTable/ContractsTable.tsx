'use client';

import * as React from 'react';
import Link from 'next/link';
import { Input } from '@workspace/ui/components/input';
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
import { useContracts } from '../../lib/hooks';
import { CONTRACT_COLUMNS, type Contract } from '../../model';

/** Отрисовка значения ячейки с учётом boolean / пустых значений. */
function renderCell(value: Contract[keyof Contract]) {
    if (typeof value === 'boolean') {
        return <Badge variant={value ? 'default' : 'secondary'}>{value ? 'да' : 'нет'}</Badge>;
    }
    if (value === null || value === undefined || value === '') {
        return <span className="text-muted-foreground">—</span>;
    }
    return String(value);
}

/** Read-only таблица глобальных видов договоров с поиском по тексту. */
export function ContractsTable() {
    const contracts = useContracts();
    const [search, setSearch] = React.useState('');

    const rows = React.useMemo(() => {
        const list = contracts.data ?? [];
        const q = search.trim().toLowerCase();
        if (!q) return list;
        return list.filter((c) =>
            [c.name, c.title, c.code, c.type]
                .filter(Boolean)
                .some((v) => String(v).toLowerCase().includes(q)),
        );
    }, [contracts.data, search]);

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-bold">Виды договоров</h1>
                <p className="text-sm text-muted-foreground">
                    Глобальный справочник `contracts` (read-only).
                </p>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
                    <CardTitle>Справочник</CardTitle>
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Поиск по названию / коду / типу"
                        className="w-72"
                    />
                </CardHeader>
                <CardContent>
                    {contracts.isLoading ? (
                        <p className="text-sm text-muted-foreground">Загрузка…</p>
                    ) : contracts.isError ? (
                        <p className="text-sm text-destructive">
                            Не удалось загрузить справочник.
                        </p>
                    ) : rows.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Ничего не найдено.</p>
                    ) : (
                        <div className="overflow-x-auto rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {CONTRACT_COLUMNS.map((col) => (
                                            <TableHead key={col.key}>{col.label}</TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rows.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            className="cursor-pointer hover:bg-accent"
                                        >
                                            {CONTRACT_COLUMNS.map((col, ci) => (
                                                <TableCell key={col.key} className="p-0">
                                                    <Link
                                                        href={`/konstructor/contract/${row.id}`}
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
