'use client';

import * as React from 'react';
import { usePortal } from '@/modules/entities/portal/hooks';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@workspace/ui/components/accordion';
import { Button } from '@workspace/ui/components/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
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
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { JsonView, PresenceBadge } from '../../../../lib/ui';
import { PBX_GROUPS, type PbxGroup } from '../../../../lib/model/common';
import {
    useInstallLeadStages,
    useLeadStageMapping,
    useMapLeadStages,
} from '../../lib/hooks';
import type { MapLeadStageItem } from '../../model';

/** Sentinel for "не сопоставлено" in the Select (empty value is not allowed). */
const NONE = '__none__';

export function LeadStagesPanel({ portalId }: { portalId: number }) {
    const portal = usePortal(portalId);
    const domain = portal.data?.domain;

    const [group, setGroup] = React.useState<PbxGroup>('sales');
    const screen = useLeadStageMapping(domain, group);
    const mapStages = useMapLeadStages();
    const installStages = useInstallLeadStages();
    const [notice, setNotice] = React.useState<string | null>(null);

    const templateStages = screen.data?.templateStages ?? [];
    const bitrixStatuses = screen.data?.bitrixStatuses ?? [];
    const portalStages = screen.data?.portalStages ?? [];

    // selection: templateStageCode -> bitrixStatusId (STATUS_ID) | NONE
    const [selection, setSelection] = React.useState<Record<string, string>>({});

    // Prefill selection from the current PortalDB mapping whenever the screen reloads.
    React.useEffect(() => {
        const next: Record<string, string> = {};
        for (const stage of templateStages) {
            const existing = portalStages.find((p) => p.code === stage.code);
            next[stage.code] =
                existing?.bitrixId != null ? String(existing.bitrixId) : NONE;
        }
        setSelection(next);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [screen.data]);

    /** Есть ли install-стадии, которых ещё нет среди статусов Bitrix. */
    const missingInstallStages = templateStages.filter(
        (stage) =>
            stage.installMode === 'create' &&
            stage.bitrixStatusId &&
            !bitrixStatuses.some((s) => s.STATUS_ID === stage.bitrixStatusId),
    );

    const runInstall = () => {
        if (!domain) return;
        setNotice(null);
        installStages.mutate(
            { domain, group },
            {
                onSuccess: (result) =>
                    setNotice(
                        `Установка выполнена: ${result.items
                            .map((i) => `${i.code} — ${i.action}`)
                            .join(', ')}.`,
                    ),
                onError: (e) =>
                    setNotice(
                        `Ошибка установки: ${e instanceof Error ? e.message : 'не удалось установить'}`,
                    ),
            },
        );
    };

    const save = () => {
        if (!domain) return;
        const mappings: MapLeadStageItem[] = Object.entries(selection)
            .filter(([, statusId]) => statusId && statusId !== NONE)
            .map(([templateStageCode, bitrixStatusId]) => ({
                templateStageCode,
                bitrixStatusId,
            }));
        setNotice(null);
        mapStages.mutate(
            { domain, group, mappings },
            {
                onSuccess: () =>
                    setNotice(`Сопоставление сохранено: ${mappings.length} стадий.`),
                onError: (e) =>
                    setNotice(
                        `Ошибка: ${e instanceof Error ? e.message : 'не удалось сохранить'}`,
                    ),
            },
        );
    };

    if (!portal.isLoading && !domain) {
        return (
            <p className="text-sm text-destructive">
                У портала не задан domain — сопоставление недоступно.
            </p>
        );
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Стадии лида: установка и сопоставление</CardTitle>
                    <CardDescription className="space-y-2">
                        <span className="block">
                            Стадии с пометкой <b>install</b> создаются в Bitrix кнопкой
                            «Установить недостающие» (`crm.status.add`, ENTITY_ID=STATUS)
                            — аддитивно, чужие статусы портала не изменяются и не
                            удаляются. Остальные (map-only) сопоставляются вручную с
                            существующими статусами.
                        </span>
                        <span className="block">
                            Результат пишется в PortalDB (`btx_stages`): данные из шаблона
                            + `bitrixId = STATUS_ID`. Снятое сопоставление map-only стадии
                            удаляет её строку из БД; кэш портала сбрасывается
                            автоматически.
                        </span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">Группа:</span>
                        <Select
                            value={group}
                            onValueChange={(v) => setGroup(v as PbxGroup)}
                        >
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {PBX_GROUPS.map((g) => (
                                    <SelectItem key={g.value} value={g.value}>
                                        {g.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <span className="text-xs text-muted-foreground">
                            Портал: {domain ?? '…'}
                        </span>
                    </div>

                    {notice && <p className="text-xs text-amber-600">{notice}</p>}

                    {screen.isLoading ? (
                        <p className="text-sm text-muted-foreground">Загрузка…</p>
                    ) : templateStages.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Для группы нет шаблонных стадий.
                        </p>
                    ) : (
                        <div className="overflow-x-auto rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-56">
                                            Шаблонная стадия
                                        </TableHead>
                                        <TableHead className="w-40">Код</TableHead>
                                        <TableHead className="w-28 text-center">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <span className="cursor-help underline decoration-dotted">
                                                        Установка
                                                    </span>
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-xs">
                                                    install — стадия создаётся в Bitrix
                                                    кнопкой; map-only — сопоставляется
                                                    вручную. «Стадия ОП» — зеркало стадии
                                                    воронки продаж.
                                                </TooltipContent>
                                            </Tooltip>
                                        </TableHead>
                                        <TableHead className="w-24 text-center">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <span className="cursor-help underline decoration-dotted">
                                                        В БД
                                                    </span>
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-xs">
                                                    Стадия уже сопоставлена и записана в
                                                    PortalDB (`btx_stages`).
                                                </TooltipContent>
                                            </Tooltip>
                                        </TableHead>
                                        <TableHead>Статус лида Bitrix</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {templateStages.map((stage) => {
                                        const mapped = portalStages.some(
                                            (p) => p.code === stage.code,
                                        );
                                        return (
                                            <TableRow key={stage.code}>
                                                <TableCell className="font-medium">
                                                    <span className="flex items-center gap-2">
                                                        <span
                                                            className="inline-block h-3 w-3 rounded-full"
                                                            style={{
                                                                backgroundColor:
                                                                    stage.color,
                                                            }}
                                                        />
                                                        {stage.title}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="font-mono text-xs text-muted-foreground">
                                                    {stage.code}
                                                    {stage.dealStageCode && (
                                                        <span className="ml-1 rounded bg-amber-100 px-1 text-[10px] text-amber-800">
                                                            ОП: {stage.dealStageCode}
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {stage.installMode ===
                                                    'create' ? (
                                                        <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-medium text-sky-800">
                                                            install
                                                            {stage.bitrixStatusId &&
                                                            bitrixStatuses.some(
                                                                (s) =>
                                                                    s.STATUS_ID ===
                                                                    stage.bitrixStatusId,
                                                            )
                                                                ? ' ✓'
                                                                : ''}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] text-muted-foreground">
                                                            map-only
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <PresenceBadge present={mapped} />
                                                </TableCell>
                                                <TableCell>
                                                    <Select
                                                        value={
                                                            selection[stage.code] ?? NONE
                                                        }
                                                        onValueChange={(v) =>
                                                            setSelection((prev) => ({
                                                                ...prev,
                                                                [stage.code]: v,
                                                            }))
                                                        }
                                                    >
                                                        <SelectTrigger className="w-72">
                                                            <SelectValue placeholder="— не сопоставлено" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value={NONE}>
                                                                — не сопоставлено
                                                            </SelectItem>
                                                            {bitrixStatuses.map(
                                                                (status) => (
                                                                    <SelectItem
                                                                        key={
                                                                            status.STATUS_ID
                                                                        }
                                                                        value={
                                                                            status.STATUS_ID
                                                                        }
                                                                    >
                                                                        {status.NAME} (
                                                                        {status.STATUS_ID})
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-3">
                        {missingInstallStages.length > 0 && (
                            <span className="text-xs text-muted-foreground">
                                Не установлено в Bitrix:{' '}
                                {missingInstallStages
                                    .map((s) => s.title)
                                    .join(', ')}
                            </span>
                        )}
                        <Button
                            variant="outline"
                            onClick={runInstall}
                            disabled={
                                !domain ||
                                installStages.isPending ||
                                templateStages.every(
                                    (s) => s.installMode !== 'create',
                                )
                            }
                        >
                            {installStages.isPending
                                ? 'Установка…'
                                : 'Установить недостающие'}
                        </Button>
                        <Button
                            onClick={save}
                            disabled={
                                !domain ||
                                mapStages.isPending ||
                                templateStages.length === 0
                            }
                        >
                            {mapStages.isPending ? 'Сохранение…' : 'Сопоставить'}
                        </Button>
                    </div>

                    <Accordion type="single" collapsible>
                        <AccordionItem value="raw">
                            <AccordionTrigger className="text-sm">
                                Сырой ответ мониторинга
                            </AccordionTrigger>
                            <AccordionContent>
                                <JsonView data={screen.data} />
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    );
}
