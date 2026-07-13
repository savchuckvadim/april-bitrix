'use client';

import * as React from 'react';
import { usePortal } from '@/modules/entities/portal/hooks';
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
import { Badge } from '@workspace/ui/components/badge';
import { JsonView } from '../../../lib/ui';
import { PBX_GROUPS, type PbxGroup } from '../../../lib/model/common';
import {
    useBitrixDepartments,
    useDeleteDepartament,
    useDepartamentMonitoring,
    useInstallDepartament,
    useUpdateDepartament,
} from '../../lib/hooks';
import {
    DEPARTAMENT_SLOTS,
    toBitrixDepartmentRows,
    toCurrentDepartaments,
} from '../../lib/utils/departament-monitoring';

export function DepartamentPanel({ portalId }: { portalId: number }) {
    const portal = usePortal(portalId);
    const domain = portal.data?.domain;

    const monitoring = useDepartamentMonitoring(domain);
    const bitrixDepartments = useBitrixDepartments(domain);
    const installDepartament = useInstallDepartament();
    const updateDepartament = useUpdateDepartament();
    const deleteDepartament = useDeleteDepartament();

    const [group, setGroup] = React.useState<PbxGroup>('sales');
    const [installBitrixId, setInstallBitrixId] = React.useState('');
    const [notice, setNotice] = React.useState<string | null>(null);

    const departmentRows = React.useMemo(
        () => toBitrixDepartmentRows(bitrixDepartments.data),
        [bitrixDepartments.data],
    );

    const current = React.useMemo(
        () => toCurrentDepartaments(monitoring.data),
        [monitoring.data],
    );

    /** Bitrix department id → slots it is currently assigned to. */
    const assignedByBitrixId = React.useMemo(() => {
        const map = new Map<string, PbxGroup[]>();
        for (const c of current) {
            if (!c.bitrixId) continue;
            const list = map.get(c.bitrixId) ?? [];
            if (!list.includes(c.group)) list.push(c.group);
            map.set(c.bitrixId, list);
        }
        return map;
    }, [current]);

    const slotTitle = (slot: PbxGroup) =>
        DEPARTAMENT_SLOTS.find((s) => s.value === slot)?.title ?? slot;

    const assignDepartment = (
        row: { id: string; name: string },
        slot: PbxGroup,
    ) => {
        if (!domain) return;
        const title = DEPARTAMENT_SLOTS.find((s) => s.value === slot)?.title ?? slot;
        setNotice(null);
        installDepartament.mutate(
            { domain, group: slot, bitrixId: Number(row.id) },
            {
                onSuccess: () =>
                    setNotice(`«${row.name}» (ID ${row.id}) назначен как ${title}.`),
                onError: (e) =>
                    setNotice(
                        `Не удалось назначить: ${
                            e instanceof Error ? e.message : 'ошибка'
                        }`,
                    ),
            },
        );
    };

    const [editId, setEditId] = React.useState('');
    const [editName, setEditName] = React.useState('');
    const [editTitle, setEditTitle] = React.useState('');
    const [editBitrixId, setEditBitrixId] = React.useState('');
    const [deleteId, setDeleteId] = React.useState('');

    if (!portal.isLoading && !domain) {
        return (
            <p className="text-sm text-destructive">
                У портала не задан domain — установка недоступна.
            </p>
        );
    }

    const onInstall = () => {
        if (!domain || !installBitrixId) return;
        installDepartament.mutate({
            domain,
            group,
            bitrixId: Number(installBitrixId),
        });
    };

    const onUpdate = () => {
        if (!editId) return;
        updateDepartament.mutate({
            id: Number(editId),
            dto: {
                name: editName || undefined,
                title: editTitle || undefined,
                bitrixId: editBitrixId ? Number(editBitrixId) : undefined,
            },
        });
    };

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-bold">Отдел (Departament)</h1>
                <p className="text-sm text-muted-foreground">Портал: {domain ?? '…'}</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Текущие назначения</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {monitoring.isLoading ? (
                        <p className="text-sm text-muted-foreground">Загрузка…</p>
                    ) : (
                        DEPARTAMENT_SLOTS.map((slot) => {
                            const assigned = current.filter(
                                (c) => c.group === slot.value,
                            );
                            return (
                                <div
                                    key={slot.value}
                                    className="flex flex-wrap items-center gap-2 text-sm"
                                >
                                    <Badge variant="secondary">{slot.title}</Badge>
                                    <span className="text-muted-foreground">
                                        {slot.label}
                                    </span>
                                    {assigned.length === 0 ? (
                                        <span className="text-muted-foreground">
                                            — не назначен
                                        </span>
                                    ) : (
                                        assigned.map((c) => (
                                            <span
                                                key={`${c.id}-${c.bitrixId}`}
                                                className="font-medium"
                                            >
                                                {c.bitrixName || c.title || c.name || '—'}{' '}
                                                <span className="font-mono text-xs text-muted-foreground">
                                                    (bitrixId {c.bitrixId || '—'})
                                                </span>
                                            </span>
                                        ))
                                    )}
                                </div>
                            );
                        })
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Отделы Bitrix — выбрать и назначить</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {notice && <p className="text-xs text-amber-600">{notice}</p>}
                    {bitrixDepartments.isLoading ? (
                        <p className="text-sm text-muted-foreground">Загрузка…</p>
                    ) : departmentRows.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Отделы Bitrix не найдены.
                        </p>
                    ) : (
                        <div className="overflow-x-auto rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Название</TableHead>
                                        <TableHead className="w-24">ID</TableHead>
                                        <TableHead className="w-24">Родитель</TableHead>
                                        <TableHead className="w-32">Текущий</TableHead>
                                        <TableHead className="w-56">
                                            Назначить как
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {departmentRows.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell>{row.name}</TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {row.id}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground">
                                                {row.parentId ?? '—'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {(
                                                        assignedByBitrixId.get(row.id) ??
                                                        []
                                                    ).map((slot) => (
                                                        <Badge
                                                            key={slot}
                                                            variant="default"
                                                        >
                                                            {slotTitle(slot)}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-2">
                                                    {DEPARTAMENT_SLOTS.map((slot) => {
                                                        const isAssigned = (
                                                            assignedByBitrixId.get(
                                                                row.id,
                                                            ) ?? []
                                                        ).includes(slot.value);
                                                        return (
                                                            <Button
                                                                key={slot.value}
                                                                size="sm"
                                                                variant={
                                                                    isAssigned
                                                                        ? 'secondary'
                                                                        : 'outline'
                                                                }
                                                                disabled={
                                                                    installDepartament.isPending
                                                                }
                                                                onClick={() =>
                                                                    assignDepartment(
                                                                        row,
                                                                        slot.value,
                                                                    )
                                                                }
                                                            >
                                                                {isAssigned
                                                                    ? `✓ ${slot.title}`
                                                                    : `→ ${slot.title}`}
                                                            </Button>
                                                        );
                                                    })}
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

            <Card>
                <CardHeader>
                    <CardTitle>Установка отдела</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap items-end gap-3">
                    <div className="space-y-1">
                        <Label>Группа</Label>
                        <Select
                            value={group}
                            onValueChange={(v) => setGroup(v as PbxGroup)}
                        >
                            <SelectTrigger className="w-36">
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
                    </div>
                    <div className="space-y-1">
                        <Label>Bitrix department ID</Label>
                        <Input
                            type="number"
                            value={installBitrixId}
                            onChange={(e) => setInstallBitrixId(e.target.value)}
                            className="w-48"
                        />
                    </div>
                    <Button
                        onClick={onInstall}
                        disabled={installDepartament.isPending || !installBitrixId}
                    >
                        {installDepartament.isPending ? 'Установка…' : 'Установить отдел'}
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Управление отделом (PortalDB) по id</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex flex-wrap items-end gap-3">
                        <div className="space-y-1">
                            <Label>ID</Label>
                            <Input
                                type="number"
                                value={editId}
                                onChange={(e) => setEditId(e.target.value)}
                                className="w-28"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Name</Label>
                            <Input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Title</Label>
                            <Input
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Bitrix ID</Label>
                            <Input
                                type="number"
                                value={editBitrixId}
                                onChange={(e) => setEditBitrixId(e.target.value)}
                                className="w-32"
                            />
                        </div>
                        <Button
                            onClick={onUpdate}
                            disabled={updateDepartament.isPending || !editId}
                        >
                            {updateDepartament.isPending ? 'Сохранение…' : 'Обновить'}
                        </Button>
                    </div>
                    <div className="flex items-end gap-3">
                        <div className="space-y-1">
                            <Label>Удалить по ID</Label>
                            <Input
                                type="number"
                                value={deleteId}
                                onChange={(e) => setDeleteId(e.target.value)}
                                className="w-28"
                            />
                        </div>
                        <Button
                            variant="destructive"
                            onClick={() =>
                                deleteId && deleteDepartament.mutate(Number(deleteId))
                            }
                            disabled={deleteDepartament.isPending || !deleteId}
                        >
                            Удалить
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Мониторинг (PortalDB + read-only Bitrix)</CardTitle>
                </CardHeader>
                <CardContent>
                    {monitoring.isLoading ? (
                        <p className="text-sm text-muted-foreground">Загрузка…</p>
                    ) : (
                        <JsonView data={monitoring.data} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
