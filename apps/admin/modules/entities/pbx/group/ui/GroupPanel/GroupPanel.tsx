'use client';

import * as React from 'react';
import { usePortal } from '@/modules/entities/portal/hooks';
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
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { JsonView, PresenceBadge } from '../../../lib/ui';
import {
    useGroupMonitoring,
    useInstallGroup,
    useSetCallingBitrixId,
} from '../../lib/hooks';
import {
    CALLING_GROUP_SLOTS,
    toGroupRows,
    type GroupMonitoringRow,
} from '../../lib/utils/group-monitoring';
import type { PbxGroup } from '../../../lib/model/common';

export function GroupPanel({ portalId }: { portalId: number }) {
    const portal = usePortal(portalId);
    const domain = portal.data?.domain;

    const monitoring = useGroupMonitoring(domain);
    const installGroup = useInstallGroup();
    const setBitrixId = useSetCallingBitrixId();
    const [pendingSlot, setPendingSlot] = React.useState<PbxGroup | null>(null);
    const [notice, setNotice] = React.useState<string | null>(null);

    /**
     * Assign an existing Bitrix group to a department slot — persists its
     * `bitrixId` to PortalDB `callings` (nothing changes in Bitrix).
     */
    const assignToSlot = (row: GroupMonitoringRow, group: PbxGroup) => {
        if (!domain || !row.bitrixId) return;
        const title =
            CALLING_GROUP_SLOTS.find((s) => s.value === group)?.title ?? group;
        setNotice(null);
        setBitrixId.mutate(
            { domain, group, bitrixId: Number(row.bitrixId) },
            {
                onSuccess: () =>
                    setNotice(
                        `«${row.name}» (ID ${row.bitrixId}) назначена как ${title}.`,
                    ),
                onError: (e) =>
                    setNotice(
                        `Не удалось назначить: ${
                            e instanceof Error ? e.message : 'ошибка'
                        }`,
                    ),
            },
        );
    };

    const rows = React.useMemo(
        () => toGroupRows(monitoring.data),
        [monitoring.data],
    );

    const assignedFor = (group: PbxGroup): GroupMonitoringRow | undefined =>
        rows.find((r) => r.group === group && r.inDb) ??
        rows.find((r) => r.group === group);

    const install = (group: PbxGroup) => {
        if (!domain) return;
        setPendingSlot(group);
        installGroup.mutate(
            { domain, group },
            { onSettled: () => setPendingSlot(null) },
        );
    };

    if (!portal.isLoading && !domain) {
        return (
            <p className="text-sm text-destructive">
                У портала не задан domain — установка недоступна.
            </p>
        );
    }

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-bold">Группы звонков</h1>
                <p className="text-sm text-muted-foreground">
                    Портал: {domain ?? '…'}
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Назначение групп</CardTitle>
                    <CardDescription className="space-y-2">
                        <span className="block">
                            Каждой группе отдела (ОП / ОС) соответствует рабочая группа
                            Bitrix (`sonet_group`).
                        </span>
                        <span className="block">
                            <b>Создать группу в Bitrix</b> — если нужной группы на
                            портале ещё нет, кнопка создаёт её в Bitrix с фиксированным
                            именем (ОП/ОС Звонки) и зеркалит в PortalDB (`callings`).
                            Если группа уже есть — обновляет её (<b>Пересоздать</b>).
                            Повторный вызов не плодит дубликаты: upsert идёт по ключу
                            type + group + portalId.
                        </span>
                        <span className="block">
                            Если нужная группа в Bitrix уже существует, но не привязана —
                            не создавайте новую: привяжите её в таблице «Группы на
                            портале» ниже кнопкой «→ ОП/ОС Звонки».
                        </span>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-40">Отдел</TableHead>
                                    <TableHead className="w-56">
                                        Группа Bitrix
                                    </TableHead>
                                    <TableHead className="w-32 text-center">
                                        Назначено
                                    </TableHead>
                                    <TableHead>Текущая привязка</TableHead>
                                    <TableHead className="w-48">Действия</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {CALLING_GROUP_SLOTS.map((slot) => {
                                    const assigned = assignedFor(slot.value);
                                    return (
                                        <TableRow key={slot.value}>
                                            <TableCell className="font-medium">
                                                {slot.label}
                                            </TableCell>
                                            <TableCell>{slot.title}</TableCell>
                                            <TableCell className="text-center">
                                                <PresenceBadge
                                                    present={Boolean(assigned)}
                                                />
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {assigned
                                                    ? `${assigned.name}${
                                                          assigned.bitrixId
                                                              ? ` (ID ${assigned.bitrixId})`
                                                              : ''
                                                      }`
                                                    : '— не назначено'}
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            size="sm"
                                                            variant={
                                                                assigned
                                                                    ? 'outline'
                                                                    : 'default'
                                                            }
                                                            onClick={() =>
                                                                install(slot.value)
                                                            }
                                                            disabled={
                                                                (installGroup.isPending &&
                                                                    pendingSlot ===
                                                                        slot.value) ||
                                                                !domain
                                                            }
                                                        >
                                                            {pendingSlot === slot.value
                                                                ? 'Создание…'
                                                                : assigned
                                                                  ? 'Пересоздать'
                                                                  : 'Создать группу в Bitrix'}
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="max-w-xs">
                                                        Создаёт рабочую группу Bitrix
                                                        (`sonet_group`) «{slot.title}» на
                                                        портале с фиксированным именем и
                                                        зеркалит её в PortalDB
                                                        (`callings`). Если группа уже есть
                                                        — обновляет. Upsert по ключу type
                                                        + group + portalId, дубликаты не
                                                        создаются.
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Группы на портале</CardTitle>
                    <CardDescription>
                        Смерженное состояние Bitrix (`sonet_group`) и PortalDB
                        (`callings`).
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {notice && <p className="text-xs text-amber-600">{notice}</p>}
                    {monitoring.isLoading ? (
                        <p className="text-sm text-muted-foreground">Загрузка…</p>
                    ) : rows.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Групп не найдено.
                        </p>
                    ) : (
                        <div className="overflow-x-auto rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Название</TableHead>
                                        <TableHead className="w-28">Bitrix ID</TableHead>
                                        <TableHead className="w-24 text-center">
                                            Bitrix
                                        </TableHead>
                                        <TableHead className="w-24 text-center">
                                            БД
                                        </TableHead>
                                        <TableHead className="w-64">
                                            Назначить как
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rows.map((row) => (
                                        <TableRow key={row.key}>
                                            <TableCell>{row.name}</TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {row.bitrixId || '—'}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <PresenceBadge present={row.inBitrix} />
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <PresenceBadge present={row.inDb} />
                                            </TableCell>
                                            <TableCell>
                                                {row.inBitrix && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {CALLING_GROUP_SLOTS.map(
                                                            (slot) => (
                                                                <Tooltip key={slot.value}>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            disabled={
                                                                                setBitrixId.isPending ||
                                                                                !row.bitrixId
                                                                            }
                                                                            onClick={() =>
                                                                                assignToSlot(
                                                                                    row,
                                                                                    slot.value,
                                                                                )
                                                                            }
                                                                        >
                                                                            → {slot.title}
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent className="max-w-xs">
                                                                        Привязывает эту
                                                                        существующую группу
                                                                        Bitrix (ID{' '}
                                                                        {row.bitrixId || '—'})
                                                                        к слоту «{slot.title}
                                                                        »: записывает её
                                                                        bitrixId в PortalDB
                                                                        (`callings`). В
                                                                        Bitrix ничего не
                                                                        создаётся и не
                                                                        меняется.
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            ),
                                                        )}
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    <Accordion type="single" collapsible>
                        <AccordionItem value="raw">
                            <AccordionTrigger className="text-sm">
                                Сырой ответ мониторинга
                            </AccordionTrigger>
                            <AccordionContent>
                                <JsonView data={monitoring.data} />
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    );
}
