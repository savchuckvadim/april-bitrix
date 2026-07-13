'use client';

import * as React from 'react';
import { usePortal } from '@/modules/entities/portal/hooks';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
} from '@workspace/ui/components/table';
import { useDeleteProvider, useProvidersByDomain } from '../../lib/hooks';
import { PROVIDER_RQ_FIELDS, type Provider } from '../../model';
import { ProviderForm } from '../ProviderForm';
import { RqForm } from '../RqForm';

/**
 * Ответы бэка по поставщику слабо типизированы (`{ [key: string]: unknown }`).
 * Нормализуем то, что нужно UI: id поставщика (для удаления), id реквизитов
 * (для PATCH) и плоскую карту полей реквизитов (для отображения/редактирования).
 *
 * Реальная форма payload уточняется на рантайме — здесь перебираем частые варианты.
 */
interface NormalizedProvider {
    providerId: number | null;
    rqId: number | null;
    rq: Record<string, unknown>;
    title: string;
}

function normalizeProvider(raw: Provider, index: number): NormalizedProvider {
    const p = raw as Record<string, unknown>;
    const nested =
        p.rq && typeof p.rq === 'object' ? (p.rq as Record<string, unknown>) : null;
    const rq = nested ?? p;

    const toNum = (v: unknown): number | null =>
        typeof v === 'number' ? v : typeof v === 'string' ? Number(v) || null : null;

    const providerId = toNum(p.id ?? p.agentId);
    const rqId = toNum((nested?.id ?? p.rqId ?? p.id) as unknown);
    const title =
        (typeof p.name === 'string' && p.name) ||
        (typeof rq.name === 'string' && (rq.name as string)) ||
        (typeof rq.shortname === 'string' && (rq.shortname as string)) ||
        `Поставщик ${index + 1}`;

    return { providerId, rqId, rq, title };
}

function ProviderCard({
    raw,
    index,
    domain,
}: {
    raw: Provider;
    index: number;
    domain: string;
}) {
    const { providerId, rqId, rq, title } = normalizeProvider(raw, index);
    const del = useDeleteProvider(domain);
    const [editing, setEditing] = React.useState(false);
    const [confirmDelete, setConfirmDelete] = React.useState(false);

    const filled = PROVIDER_RQ_FIELDS.filter((f) => {
        const v = rq[f.key as string];
        return v != null && v !== '';
    });

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription className="flex gap-2 pt-1">
                        {typeof rq.type === 'string' && (
                            <Badge variant="outline">{rq.type}</Badge>
                        )}
                        {rq.inn != null && rq.inn !== '' && (
                            <span className="text-xs text-muted-foreground">
                                ИНН: {String(rq.inn)}
                            </span>
                        )}
                    </CardDescription>
                </div>
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditing(true)}
                        disabled={rqId == null}
                    >
                        Редактировать
                    </Button>
                    {confirmDelete ? (
                        <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive"
                            disabled={del.isPending || providerId == null}
                            onClick={() =>
                                providerId != null && del.mutate(providerId)
                            }
                        >
                            {del.isPending ? 'Удаление…' : 'Точно удалить?'}
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive"
                            onClick={() => setConfirmDelete(true)}
                            disabled={providerId == null}
                        >
                            Удалить
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {filled.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Реквизиты не заполнены.
                    </p>
                ) : (
                    <div className="overflow-x-auto rounded-md border">
                        <Table>
                            <TableBody>
                                {filled.map((f) => (
                                    <TableRow key={f.key}>
                                        <TableCell className="w-64 font-medium text-muted-foreground">
                                            {f.label}
                                        </TableCell>
                                        <TableCell>
                                            {String(rq[f.key as string])}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>

            <Dialog open={editing} onOpenChange={setEditing}>
                <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Редактирование реквизитов</DialogTitle>
                        <DialogDescription>{title}</DialogDescription>
                    </DialogHeader>
                    {rqId != null && (
                        <RqForm
                            rqId={rqId}
                            domain={domain}
                            initial={rq}
                            onDone={() => setEditing(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    );
}

export function ProviderPanel({ portalId }: { portalId: number }) {
    const portal = usePortal(portalId);
    const domain = portal.data?.domain;
    const providers = useProvidersByDomain(domain);
    const [creating, setCreating] = React.useState(false);

    return (
        <div className="space-y-4">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Поставщики</h1>
                    <p className="text-sm text-muted-foreground">
                        Портал: {portal.data?.domain ?? '…'}
                    </p>
                </div>
                <Button onClick={() => setCreating(true)} disabled={!domain}>
                    Добавить поставщика
                </Button>
            </div>

            {providers.isLoading ? (
                <p className="text-sm text-muted-foreground">Загрузка…</p>
            ) : (providers.data?.length ?? 0) === 0 ? (
                <Card>
                    <CardContent className="py-8 text-center text-sm text-muted-foreground">
                        У портала пока нет поставщиков.
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {providers.data?.map((raw, i) => (
                        <ProviderCard
                            key={i}
                            raw={raw}
                            index={i}
                            domain={domain as string}
                        />
                    ))}
                </div>
            )}

            <Dialog open={creating} onOpenChange={setCreating}>
                <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Новый поставщик</DialogTitle>
                        <DialogDescription>
                            Поставщик создаётся вместе с реквизитами для портала{' '}
                            {domain}.
                        </DialogDescription>
                    </DialogHeader>
                    {domain && (
                        <ProviderForm
                            domain={domain}
                            onDone={() => setCreating(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
