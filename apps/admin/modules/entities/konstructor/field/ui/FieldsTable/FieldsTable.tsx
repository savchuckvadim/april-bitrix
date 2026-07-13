'use client';

import * as React from 'react';
import Link from 'next/link';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Badge } from '@workspace/ui/components/badge';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { useCreateField, useFields } from '../../lib/hooks';
import { FIELD_COLUMNS, type Field } from '../../model';
import { FieldForm } from '../FieldForm';

/** Отрисовка значения ячейки (bool → бейдж, пусто → прочерк). */
function renderCell(value: Field[keyof Field]) {
    if (typeof value === 'boolean') {
        return (
            <Badge variant={value ? 'default' : 'secondary'}>
                {value ? 'да' : 'нет'}
            </Badge>
        );
    }
    if (value === null || value === undefined || value === '') {
        return <span className="text-muted-foreground">—</span>;
    }
    return String(value);
}

/**
 * Таблица глобального справочника полей конструктора (`fields`) с поиском,
 * созданием через диалог и переходом на детали поля. `portalId` нужен только
 * для построения ссылок в рамках раздела конструктора портала.
 */
export function FieldsTable({ portalId }: { portalId: number }) {
    const fields = useFields();
    const createField = useCreateField();
    const [search, setSearch] = React.useState('');
    const [creating, setCreating] = React.useState(false);
    const [notice, setNotice] = React.useState<string | null>(null);

    const base = `/portal/${portalId}/konstructor/field`;

    const rows = React.useMemo(() => {
        const list = fields.data ?? [];
        const q = search.trim().toLowerCase();
        if (!q) return list;
        return list.filter((f) =>
            [f.name, f.code, f.type]
                .filter(Boolean)
                .some((v) => String(v).toLowerCase().includes(q)),
        );
    }, [fields.data, search]);

    return (
        <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">Поля конструктора</h1>
                    <p className="text-sm text-muted-foreground">
                        Глобальный справочник `fields` — общие поля шаблонов.
                    </p>
                </div>
                <Button onClick={() => setCreating(true)}>Добавить поле</Button>
            </div>
            {notice && <p className="text-xs text-amber-600">{notice}</p>}

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
                    {fields.isLoading ? (
                        <p className="text-sm text-muted-foreground">Загрузка…</p>
                    ) : fields.isError ? (
                        <p className="text-sm text-destructive">
                            Не удалось загрузить справочник.
                        </p>
                    ) : rows.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Ничего не найдено.
                        </p>
                    ) : (
                        <div className="overflow-x-auto rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {FIELD_COLUMNS.map((col) => (
                                            <TableHead key={col.key}>
                                                {col.label}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rows.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            className="cursor-pointer hover:bg-accent"
                                        >
                                            {FIELD_COLUMNS.map((col, ci) => (
                                                <TableCell key={col.key} className="p-0">
                                                    <Link
                                                        href={`${base}/${row.id}`}
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

            <Dialog open={creating} onOpenChange={setCreating}>
                <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Новое поле</DialogTitle>
                    </DialogHeader>
                    <FieldForm
                        submitting={createField.isPending}
                        submitLabel="Создать"
                        onCancel={() => setCreating(false)}
                        onSubmit={(values) => {
                            setNotice(null);
                            createField.mutate(values, {
                                onSuccess: () => setCreating(false),
                                onError: (e) => setNotice(getApiErrorMessage(e)),
                            });
                        }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
