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
import { useLeadStageMapping, useMapLeadStages } from '../../lib/hooks';
import type { MapLeadStageItem } from '../../model';

/** Sentinel for "не сопоставлено" in the Select (empty value is not allowed). */
const NONE = '__none__';

export function LeadStagesPanel({ portalId }: { portalId: number }) {
    const portal = usePortal(portalId);
    const domain = portal.data?.domain;

    const [group, setGroup] = React.useState<PbxGroup>('sales');
    const screen = useLeadStageMapping(domain, group);
    const mapStages = useMapLeadStages();
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
                    <CardTitle>Сопоставление стадий лида</CardTitle>
                    <CardDescription className="space-y-2">
                        <span className="block">
                            Стадии лида в Bitrix <b>не создаются</b> — их нельзя задать
                            через API. Здесь шаблонные стадии вручную сопоставляются с
                            существующими статусами лида Bitrix (`crm.status.list`,
                            ENTITY_ID=STATUS).
                        </span>
                        <span className="block">
                            Результат пишется в PortalDB (`btx_stages`): данные из шаблона
                            + `bitrixId = STATUS_ID`. Несопоставленные стадии не
                            сохраняются.
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

                    <div className="flex justify-end">
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
