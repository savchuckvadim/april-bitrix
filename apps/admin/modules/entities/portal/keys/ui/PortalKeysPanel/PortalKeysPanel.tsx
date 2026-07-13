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
import { Input } from '@workspace/ui/components/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import {
    usePortalKeys,
    useRemovePortalKey,
    useSetPortalKey,
} from '../../lib/hooks';
import { PORTAL_KEY_META, type PortalKeyMeta } from '../../model';

/** Строка одного ключа: значение, статус, сохранение и очистка. */
function KeyRow({
    portalId,
    meta,
    value,
    onNotice,
}: {
    portalId: number;
    meta: PortalKeyMeta;
    value: string | null;
    onNotice: (text: string) => void;
}) {
    const setKey = useSetPortalKey();
    const remove = useRemovePortalKey();

    const [draft, setDraft] = React.useState(value ?? '');
    const [reveal, setReveal] = React.useState(false);

    // Sync local draft when the server value changes (after save/clear/refetch).
    React.useEffect(() => {
        setDraft(value ?? '');
    }, [value]);

    const isSet = value !== null && value !== '';
    const dirty = draft !== (value ?? '');

    const save = () => {
        if (!draft) return;
        setKey.mutate(
            { portalId, keyName: meta.name, value: draft },
            {
                onSuccess: () => onNotice(`«${meta.label}» сохранён.`),
                onError: (e) =>
                    onNotice(
                        `Не удалось сохранить «${meta.label}»: ${
                            e instanceof Error ? e.message : 'ошибка'
                        }`,
                    ),
            },
        );
    };

    const clear = () => {
        remove.mutate(
            { portalId, keyName: meta.name },
            {
                onSuccess: () => onNotice(`«${meta.label}» очищен.`),
                onError: (e) =>
                    onNotice(
                        `Не удалось очистить «${meta.label}»: ${
                            e instanceof Error ? e.message : 'ошибка'
                        }`,
                    ),
            },
        );
    };

    const busy = setKey.isPending || remove.isPending;

    return (
        <TableRow>
            <TableCell className="align-top">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span className="cursor-help font-medium underline decoration-dotted">
                            {meta.label}
                        </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                        {meta.description}
                    </TooltipContent>
                </Tooltip>
                <div className="font-mono text-xs text-muted-foreground">
                    {meta.name}
                </div>
            </TableCell>
            <TableCell className="text-center align-top">
                {isSet ? (
                    <Badge variant="default">задан</Badge>
                ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                        пуст
                    </Badge>
                )}
            </TableCell>
            <TableCell className="align-top">
                <div className="flex items-center gap-2">
                    <Input
                        type={reveal ? 'text' : 'password'}
                        value={draft}
                        placeholder="—"
                        onChange={(e) => setDraft(e.target.value)}
                        className="w-72 font-mono text-xs"
                    />
                    <Button
                        size="sm"
                        variant="ghost"
                        type="button"
                        onClick={() => setReveal((r) => !r)}
                    >
                        {reveal ? 'Скрыть' : 'Показать'}
                    </Button>
                </div>
            </TableCell>
            <TableCell className="align-top">
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        onClick={save}
                        disabled={busy || !draft || !dirty}
                    >
                        {setKey.isPending ? 'Сохранение…' : 'Сохранить'}
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive"
                        onClick={clear}
                        disabled={busy || !isSet}
                    >
                        Очистить
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
}

export function PortalKeysPanel({ portalId }: { portalId: number }) {
    const portal = usePortal(portalId);
    const keys = usePortalKeys(portalId);
    const [notice, setNotice] = React.useState<string | null>(null);

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-bold">Ключи портала</h1>
                <p className="text-sm text-muted-foreground">
                    Портал: {portal.data?.domain ?? '…'}
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Ключи интеграций</CardTitle>
                    <CardDescription>
                        Ключи интеграций портала хранятся в БД в зашифрованном виде и
                        отдаются наружу расшифрованными. «Сохранить» шифрует и записывает
                        значение, «Очистить» записывает null.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {notice && <p className="text-xs text-amber-600">{notice}</p>}
                    {keys.isLoading ? (
                        <p className="text-sm text-muted-foreground">Загрузка…</p>
                    ) : (
                        <div className="overflow-x-auto rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-56">Ключ</TableHead>
                                        <TableHead className="w-24 text-center">
                                            Статус
                                        </TableHead>
                                        <TableHead>Значение</TableHead>
                                        <TableHead className="w-56">Действия</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {PORTAL_KEY_META.map((meta) => (
                                        <KeyRow
                                            key={meta.name}
                                            portalId={portalId}
                                            meta={meta}
                                            value={keys.data?.[meta.name] ?? null}
                                            onNotice={setNotice}
                                        />
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
