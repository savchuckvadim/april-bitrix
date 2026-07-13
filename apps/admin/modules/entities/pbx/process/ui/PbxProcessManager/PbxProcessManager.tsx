'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { usePortal } from '@/modules/entities/portal/hooks';
import { ConfirmDialog } from '@/modules/shared/ui';
import { Badge } from '@workspace/ui/components/badge';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@workspace/ui/components/accordion';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { Button } from '@workspace/ui/components/button';
import { Label } from '@workspace/ui/components/label';
import { Checkbox } from '@workspace/ui/components/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { JsonView, PresenceBadge } from '../../../lib/ui';
import { usePbxProcess } from '../../lib/hooks';
import { describeProcessRecord } from '../../lib/utils/describe-process';
import type { PbxProcessAdapter, PbxProcessRow } from '../../model';

const ID_KEYS = ['id', 'typeId', 'entityTypeId', 'bitrixId', 'entity_type'];

function shortIds(details: Record<string, unknown> | null): string {
    if (!details) return '';
    return ID_KEYS.filter((k) => details[k] !== undefined && details[k] !== '')
        .map((k) => `${k}: ${String(details[k])}`)
        .join(' · ');
}

/**
 * Reusable list of available process types (Smart / RPA) with full install
 * (type + fields + funnels/stages), delete, and install status read from the
 * monitoring payload. Granular field/stage management lives in sibling tabs.
 */
export function PbxProcessManager({
    portalId,
    adapter,
}: {
    portalId: number;
    adapter: PbxProcessAdapter;
}) {
    const portal = usePortal(portalId);
    const domain = portal.data?.domain;
    const router = useRouter();
    const pathname = usePathname();

    const [group, setGroup] = React.useState<string>(
        adapter.groupOptions[0]?.value ?? '',
    );
    const [withBitrix, setWithBitrix] = React.useState(true);
    const [deleteCode, setDeleteCode] = React.useState<string | null>(null);

    const { monitoring, install, remove } = usePbxProcess(adapter, domain);

    const rows: PbxProcessRow[] = React.useMemo(() => {
        const describe = adapter.describe ?? describeProcessRecord;
        return adapter.variantOptions.map((o) => {
            const details = adapter.findInstalled(monitoring.data, o.value);
            const desc = describe(monitoring.data, o.value, group);
            return {
                code: o.value,
                label: o.label,
                installed: !!details,
                details,
                inTemplate: true,
                inBitrix: desc.inBitrix ?? !!details,
                inDb: desc.inDb ?? !!details,
                group: desc.group ?? group,
                entityTypeId: desc.entityTypeId,
                fieldCount: desc.fieldCount,
                funnelCount: desc.funnelCount,
                stageCount: desc.stageCount,
            };
        });
    }, [adapter, monitoring.data, group]);

    /** Open the dedicated drill-down page for a process row. */
    const openDetail = (code: string) =>
        router.push(`${pathname}/${group}/${code}`);

    if (!portal.isLoading && !domain) {
        return (
            <p className="text-sm text-destructive">
                У портала не задан domain — установка недоступна.
            </p>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-end gap-3 rounded-md border p-3">
                <div className="space-y-1">
                    <Label>Группа</Label>
                    <Select value={group} onValueChange={setGroup}>
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {adapter.groupOptions.map((g) => (
                                <SelectItem key={g.value} value={g.value}>
                                    {g.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                        checked={withBitrix}
                        onCheckedChange={(c) => setWithBitrix(Boolean(c))}
                    />
                    withBitrix (при удалении)
                </label>
                <p className="text-xs text-muted-foreground">
                    «Установить полностью» создаёт тип + поля + воронки/стадии.
                </p>
            </div>

            <div className="overflow-x-auto rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-56">{adapter.itemLabel}</TableHead>
                            <TableHead className="w-20">Группа</TableHead>
                            <TableHead className="w-28">entityTypeId</TableHead>
                            <TableHead className="w-14 text-center">Шаблон</TableHead>
                            <TableHead className="w-14 text-center">Bitrix</TableHead>
                            <TableHead className="w-14 text-center">БД</TableHead>
                            <TableHead className="w-28 text-center">
                                Поля / Воронки
                            </TableHead>
                            <TableHead className="w-80">Действия</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow key={row.code}>
                                <TableCell
                                    className="cursor-pointer font-medium"
                                    onClick={() => openDetail(row.code)}
                                >
                                    {row.label}
                                    <div className="font-mono text-xs text-muted-foreground">
                                        {row.code}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="font-mono text-xs">
                                        {row.group ?? group}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-mono text-xs text-muted-foreground">
                                    {row.entityTypeId ? (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span>{row.entityTypeId}</span>
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-xs font-mono text-xs">
                                                {shortIds(row.details) || row.entityTypeId}
                                            </TooltipContent>
                                        </Tooltip>
                                    ) : (
                                        '—'
                                    )}
                                </TableCell>
                                <TableCell className="text-center">
                                    <PresenceBadge present={row.inTemplate} />
                                </TableCell>
                                <TableCell className="text-center">
                                    <PresenceBadge present={row.inBitrix} />
                                </TableCell>
                                <TableCell className="text-center">
                                    <PresenceBadge present={row.inDb} />
                                </TableCell>
                                <TableCell className="text-center text-xs text-muted-foreground">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span>
                                                {row.fieldCount ?? '—'} /{' '}
                                                {row.funnelCount ?? '—'}
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-xs">
                                            Полей: {row.fieldCount ?? '—'}, воронок:{' '}
                                            {row.funnelCount ?? '—'}
                                            {row.stageCount !== undefined
                                                ? `, стадий: ${row.stageCount}`
                                                : ''}
                                            . Счётчики — best-effort из мониторинга;
                                            точные значения на странице процесса.
                                        </TooltipContent>
                                    </Tooltip>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-2">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => openDetail(row.code)}
                                                >
                                                    Открыть
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-xs">
                                                Открыть страницу процесса «{row.label}»:
                                                поля и воронки/стадии именно этого процесса
                                                ({group}) — без ручного выбора пересечения.
                                            </TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        install.mutate({
                                                            code: row.code,
                                                            group,
                                                        })
                                                    }
                                                    disabled={
                                                        (install.isPending &&
                                                            install.variables?.code ===
                                                                row.code) ||
                                                        !domain
                                                    }
                                                >
                                                    {install.isPending &&
                                                    install.variables?.code === row.code
                                                        ? 'Установка…'
                                                        : 'Установить полностью'}
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-xs">
                                                Полная установка процесса «{row.label}» на
                                                портал: создаёт тип, его поля и
                                                воронки/стадии в Bitrix и зеркалит в
                                                PortalDB. Повторный запуск обновляет, не
                                                плодя дубликаты.
                                            </TooltipContent>
                                        </Tooltip>
                                        {row.installed && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() =>
                                                            setDeleteCode(row.code)
                                                        }
                                                        disabled={
                                                            remove.isPending &&
                                                            remove.variables?.code ===
                                                                row.code
                                                        }
                                                    >
                                                        Удалить
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-xs">
                                                    Удалить процесс «{row.label}» с портала.
                                                    Флаг «withBitrix» сверху определяет,
                                                    удалять ли данные и в Bitrix.
                                                </TooltipContent>
                                            </Tooltip>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Accordion type="single" collapsible>
                <AccordionItem value="raw">
                    <AccordionTrigger className="text-sm">
                        Сырой ответ мониторинга
                    </AccordionTrigger>
                    <AccordionContent>
                        {monitoring.isLoading ? (
                            <p className="text-sm text-muted-foreground">Загрузка…</p>
                        ) : (
                            <JsonView data={monitoring.data} />
                        )}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            <ConfirmDialog
                open={Boolean(deleteCode)}
                onOpenChange={(o) => !o && setDeleteCode(null)}
                title={`Удалить ${adapter.itemLabel}?`}
                description={`Удалить «${deleteCode ?? ''}» (${group})${
                    withBitrix ? ' вместе с данными в Bitrix' : ' только в PortalDB'
                }?`}
                confirmLabel="Удалить"
                variant="destructive"
                onConfirm={async () => {
                    if (!deleteCode) return;
                    await remove.mutateAsync({
                        code: deleteCode,
                        group,
                        withBitrix,
                    });
                    setDeleteCode(null);
                }}
            />
        </div>
    );
}
