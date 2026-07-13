'use client';

import * as React from 'react';
import { usePortal } from '@/modules/entities/portal/hooks';
import { useProvidersByDomain } from '@/modules/entities/portal-provider';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import {
    useCreateNumerator,
    useDeleteNumerator,
    useNumeratorsByRq,
} from '../../lib/hooks';
import { normalizeRqOptions } from '../../lib/utils/normalize-rqs';
import { NUMERATOR_TYPE_LABELS, type NumeratorType } from '../../model';
import { NumeratorForm } from '../NumeratorForm';

/**
 * Нумераторы документов портала в разрезе реквизитов (Rq). Сначала выбираем
 * реквизит портала (через поставщиков), затем управляем его нумераторами
 * (`counters` + pivot `rq_counter`): создание, удаление.
 */
export function NumeratorsPanel({ portalId }: { portalId: number }) {
    const portal = usePortal(portalId);
    const domain = portal.data?.domain;
    const providers = useProvidersByDomain(domain);

    const rqOptions = React.useMemo(
        () => normalizeRqOptions(providers.data ?? []),
        [providers.data],
    );

    const [rqId, setRqId] = React.useState<number | null>(null);
    React.useEffect(() => {
        if (rqId == null && rqOptions.length > 0) {
            setRqId(rqOptions[0]!.id);
        }
    }, [rqOptions, rqId]);

    const numerators = useNumeratorsByRq(rqId ?? undefined);
    const createNumerator = useCreateNumerator();
    const deleteNumerator = useDeleteNumerator();

    const [creating, setCreating] = React.useState(false);
    const [notice, setNotice] = React.useState<string | null>(null);

    return (
        <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">Нумераторы</h1>
                    <p className="text-sm text-muted-foreground">
                        Нумерация документов в разрезе реквизитов портала: {domain ?? '…'}
                    </p>
                </div>
                <Button
                    onClick={() => setCreating(true)}
                    disabled={rqId == null}
                >
                    Добавить нумератор
                </Button>
            </div>
            {notice && <p className="text-xs text-amber-600">{notice}</p>}

            <Card>
                <CardHeader>
                    <CardTitle>Реквизит (Rq)</CardTitle>
                </CardHeader>
                <CardContent>
                    {providers.isLoading ? (
                        <p className="text-sm text-muted-foreground">Загрузка…</p>
                    ) : rqOptions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            У портала нет реквизитов. Сначала добавьте поставщика с
                            реквизитами в разделе «Поставщики».
                        </p>
                    ) : (
                        <Select
                            value={rqId != null ? String(rqId) : ''}
                            onValueChange={(v) => setRqId(Number(v))}
                        >
                            <SelectTrigger className="w-96">
                                <SelectValue placeholder="Выберите реквизит" />
                            </SelectTrigger>
                            <SelectContent>
                                {rqOptions.map((o) => (
                                    <SelectItem key={o.id} value={String(o.id)}>
                                        {o.name} (#{o.id})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </CardContent>
            </Card>

            {rqId != null && (
                <Card>
                    <CardHeader>
                        <CardTitle>Нумераторы реквизита</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {numerators.isLoading ? (
                            <p className="text-sm text-muted-foreground">Загрузка…</p>
                        ) : numerators.isError ? (
                            <p className="text-sm text-destructive">
                                Не удалось загрузить нумераторы.
                            </p>
                        ) : (numerators.data?.length ?? 0) === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                У реквизита пока нет нумераторов.
                            </p>
                        ) : (
                            <div className="overflow-x-auto rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Название</TableHead>
                                            <TableHead>Тип</TableHead>
                                            <TableHead>Префикс</TableHead>
                                            <TableHead>Д/М/Г</TableHead>
                                            <TableHead>count</TableHead>
                                            <TableHead>size</TableHead>
                                            <TableHead className="w-24 text-right">
                                                Действия
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(numerators.data ?? []).map((n) => {
                                            const type = n.pivot.type as
                                                | NumeratorType
                                                | null
                                                | undefined;
                                            return (
                                                <TableRow key={n.id}>
                                                    <TableCell>
                                                        {n.title || n.name}
                                                    </TableCell>
                                                    <TableCell>
                                                        {type
                                                            ? NUMERATOR_TYPE_LABELS[type] ??
                                                              type
                                                            : '—'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {n.pivot.prefix || '—'}
                                                    </TableCell>
                                                    <TableCell className="space-x-1">
                                                        {n.pivot.day && (
                                                            <Badge variant="outline">
                                                                Д
                                                            </Badge>
                                                        )}
                                                        {n.pivot.month && (
                                                            <Badge variant="outline">
                                                                М
                                                            </Badge>
                                                        )}
                                                        {n.pivot.year && (
                                                            <Badge variant="outline">
                                                                Г
                                                            </Badge>
                                                        )}
                                                        {!n.pivot.day &&
                                                            !n.pivot.month &&
                                                            !n.pivot.year &&
                                                            '—'}
                                                    </TableCell>
                                                    <TableCell>{n.pivot.count}</TableCell>
                                                    <TableCell>{n.pivot.size}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-destructive"
                                                            disabled={
                                                                deleteNumerator.isPending
                                                            }
                                                            onClick={() => {
                                                                setNotice(null);
                                                                deleteNumerator.mutate(
                                                                    Number(n.id),
                                                                    {
                                                                        onError: (e) =>
                                                                            setNotice(
                                                                                getApiErrorMessage(
                                                                                    e,
                                                                                ),
                                                                            ),
                                                                    },
                                                                );
                                                            }}
                                                        >
                                                            Удалить
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            <Dialog open={creating} onOpenChange={setCreating}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Новый нумератор</DialogTitle>
                    </DialogHeader>
                    {rqId != null && (
                        <NumeratorForm
                            rqId={rqId}
                            submitting={createNumerator.isPending}
                            onCancel={() => setCreating(false)}
                            onSubmit={(values) => {
                                setNotice(null);
                                createNumerator.mutate(values, {
                                    onSuccess: () => setCreating(false),
                                    onError: (e) => setNotice(getApiErrorMessage(e)),
                                });
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
