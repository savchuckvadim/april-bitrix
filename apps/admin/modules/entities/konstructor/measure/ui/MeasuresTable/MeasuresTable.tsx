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
import { useMeasures } from '../../lib/hooks';
import { MEASURE_COLUMNS, type Measure } from '../../model';

/** Отрисовка значения ячейки с учётом пустых значений. */
function renderCell(value: Measure[keyof Measure]) {
    if (value === null || value === undefined || value === '') {
        return <span className="text-muted-foreground">—</span>;
    }
    return String(value);
}

/** Read-only таблица глобальных единиц измерения с поиском по тексту. */
export function MeasuresTable() {
    const measures = useMeasures();
    const [search, setSearch] = React.useState('');

    const rows = React.useMemo(() => {
        const list = measures.data ?? [];
        const q = search.trim().toLowerCase();
        if (!q) return list;
        return list.filter((m) =>
            [m.name, m.shortName, m.fullName, m.code, m.type]
                .filter(Boolean)
                .some((v) => String(v).toLowerCase().includes(q)),
        );
    }, [measures.data, search]);

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-bold">Единицы измерения</h1>
                <p className="text-sm text-muted-foreground">
                    Глобальный справочник `measures` (read-only).
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
                    {measures.isLoading ? (
                        <p className="text-sm text-muted-foreground">Загрузка…</p>
                    ) : measures.isError ? (
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
                                        {MEASURE_COLUMNS.map((col) => (
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
                                            {MEASURE_COLUMNS.map((col, ci) => (
                                                <TableCell key={col.key} className="p-0">
                                                    <Link
                                                        href={`/konstructor/measure/${row.id}`}
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
