'use client';

import * as React from 'react';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
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
import {
    useCounters,
    useCreateCounter,
    useDeleteCounter,
    useUpdateCounter,
} from '../../lib/hooks';
import { COUNTER_COLUMNS, type Counter } from '../../model';

interface CounterDraft {
    id: number | null;
    name: string;
    title: string;
}

const EMPTY: CounterDraft = { id: null, name: '', title: '' };

/**
 * Панель глобального справочника счётчиков конструктора (`counters`): список,
 * создание и редактирование через диалог, удаление. Используется как справочник
 * для нумераторов и связей шаблон↔счётчик.
 */
export function CountersPanel() {
    const counters = useCounters();
    const createCounter = useCreateCounter();
    const updateCounter = useUpdateCounter();
    const deleteCounter = useDeleteCounter();

    const [draft, setDraft] = React.useState<CounterDraft | null>(null);
    const [notice, setNotice] = React.useState<string | null>(null);

    const saving = createCounter.isPending || updateCounter.isPending;
    const canSave = !!draft && draft.name.trim() && draft.title.trim();

    const save = () => {
        if (!draft || !canSave) return;
        setNotice(null);
        const onError = (e: Error) => setNotice(getApiErrorMessage(e));
        const onSuccess = () => setDraft(null);
        if (draft.id == null) {
            createCounter.mutate(
                { name: draft.name.trim(), title: draft.title.trim() },
                { onSuccess, onError },
            );
        } else {
            updateCounter.mutate(
                {
                    id: draft.id,
                    dto: { name: draft.name.trim(), title: draft.title.trim() },
                },
                { onSuccess, onError },
            );
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">Счётчики</h1>
                    <p className="text-sm text-muted-foreground">
                        Глобальный справочник `counters` для нумераторов и шаблонов.
                    </p>
                </div>
                <Button onClick={() => setDraft({ ...EMPTY })}>
                    Добавить счётчик
                </Button>
            </div>
            {notice && <p className="text-xs text-amber-600">{notice}</p>}

            <Card>
                <CardHeader>
                    <CardTitle>Справочник</CardTitle>
                </CardHeader>
                <CardContent>
                    {counters.isLoading ? (
                        <p className="text-sm text-muted-foreground">Загрузка…</p>
                    ) : counters.isError ? (
                        <p className="text-sm text-destructive">
                            Не удалось загрузить справочник.
                        </p>
                    ) : (counters.data?.length ?? 0) === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Счётчиков пока нет.
                        </p>
                    ) : (
                        <div className="overflow-x-auto rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {COUNTER_COLUMNS.map((col) => (
                                            <TableHead key={col.key}>
                                                {col.label}
                                            </TableHead>
                                        ))}
                                        <TableHead className="w-40 text-right">
                                            Действия
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(counters.data ?? []).map((row: Counter) => (
                                        <TableRow key={row.id}>
                                            {COUNTER_COLUMNS.map((col) => (
                                                <TableCell key={col.key}>
                                                    {String(row[col.key] ?? '—')}
                                                </TableCell>
                                            ))}
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            setDraft({
                                                                id: row.id,
                                                                name: row.name,
                                                                title: row.title,
                                                            })
                                                        }
                                                    >
                                                        Изменить
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-destructive"
                                                        disabled={deleteCounter.isPending}
                                                        onClick={() => {
                                                            setNotice(null);
                                                            deleteCounter.mutate(row.id, {
                                                                onError: (e) =>
                                                                    setNotice(
                                                                        getApiErrorMessage(e),
                                                                    ),
                                                            });
                                                        }}
                                                    >
                                                        Удалить
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!draft} onOpenChange={(o) => !o && setDraft(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {draft?.id == null ? 'Новый счётчик' : 'Редактирование счётчика'}
                        </DialogTitle>
                    </DialogHeader>
                    {draft && (
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <Label>Системное имя *</Label>
                                <Input
                                    value={draft.name}
                                    onChange={(e) =>
                                        setDraft((d) =>
                                            d ? { ...d, name: e.target.value } : d,
                                        )
                                    }
                                    placeholder="invoice_number"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label>Название *</Label>
                                <Input
                                    value={draft.title}
                                    onChange={(e) =>
                                        setDraft((d) =>
                                            d ? { ...d, title: e.target.value } : d,
                                        )
                                    }
                                    placeholder="Номер счёта"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setDraft(null)}
                                    disabled={saving}
                                >
                                    Отмена
                                </Button>
                                <Button onClick={save} disabled={!canSave || saving}>
                                    {saving ? 'Сохранение…' : 'Сохранить'}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
