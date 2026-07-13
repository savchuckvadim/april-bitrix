'use client';

import * as React from 'react';
import Link from 'next/link';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import { Button } from '@workspace/ui/components/button';
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
import {
    useCreateTemplate,
    useDeleteTemplate,
    useTemplatesByPortal,
} from '../../lib/hooks';
import { TemplateForm } from '../TemplateForm';

/**
 * Список шаблонов конструктора портала (`templates`) со связями, создание через
 * диалог и удаление. Портал берётся из `portalId` (роутинг).
 */
export function TemplatesPanel({ portalId }: { portalId: number }) {
    const templates = useTemplatesByPortal(portalId);
    const createTemplate = useCreateTemplate();
    const deleteTemplate = useDeleteTemplate();

    const [creating, setCreating] = React.useState(false);
    const [notice, setNotice] = React.useState<string | null>(null);

    const base = `/portal/${portalId}/konstructor/template`;

    return (
        <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">Шаблоны</h1>
                    <p className="text-sm text-muted-foreground">
                        Шаблоны документов портала (`templates`) и их поля/счётчики.
                    </p>
                </div>
                <Button onClick={() => setCreating(true)}>Добавить шаблон</Button>
            </div>
            {notice && <p className="text-xs text-amber-600">{notice}</p>}

            <Card>
                <CardHeader>
                    <CardTitle>Шаблоны портала</CardTitle>
                </CardHeader>
                <CardContent>
                    {templates.isLoading ? (
                        <p className="text-sm text-muted-foreground">Загрузка…</p>
                    ) : templates.isError ? (
                        <p className="text-sm text-destructive">
                            Не удалось загрузить шаблоны.
                        </p>
                    ) : (templates.data?.length ?? 0) === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            У портала пока нет шаблонов.
                        </p>
                    ) : (
                        <div className="overflow-x-auto rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Название</TableHead>
                                        <TableHead>Код</TableHead>
                                        <TableHead>Тип</TableHead>
                                        <TableHead>Поля</TableHead>
                                        <TableHead>Счётчики</TableHead>
                                        <TableHead className="w-24 text-right">
                                            Действия
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(templates.data ?? []).map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell>
                                                <Link
                                                    href={`${base}/${row.id}`}
                                                    className="text-primary underline"
                                                >
                                                    {row.id}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <Link
                                                    href={`${base}/${row.id}`}
                                                    className="hover:underline"
                                                >
                                                    {row.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell>{row.code}</TableCell>
                                            <TableCell>{row.type ?? '—'}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {row.fields?.length ?? 0}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {row.counters?.length ?? 0}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-destructive"
                                                    disabled={deleteTemplate.isPending}
                                                    onClick={() => {
                                                        setNotice(null);
                                                        deleteTemplate.mutate(row.id, {
                                                            onError: (e) =>
                                                                setNotice(
                                                                    getApiErrorMessage(e),
                                                                ),
                                                        });
                                                    }}
                                                >
                                                    Удалить
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={creating} onOpenChange={setCreating}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Новый шаблон</DialogTitle>
                    </DialogHeader>
                    <TemplateForm
                        submitting={createTemplate.isPending}
                        submitLabel="Создать"
                        onCancel={() => setCreating(false)}
                        onSubmit={(values) => {
                            setNotice(null);
                            createTemplate.mutate(
                                { ...values, portalId },
                                {
                                    onSuccess: () => setCreating(false),
                                    onError: (e) => setNotice(getApiErrorMessage(e)),
                                },
                            );
                        }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
