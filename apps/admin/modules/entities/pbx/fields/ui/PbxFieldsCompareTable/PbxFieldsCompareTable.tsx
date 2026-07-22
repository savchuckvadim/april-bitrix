'use client';

import * as React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { Button } from '@workspace/ui/components/button';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { PresenceBadge, FieldSyncStatus } from '../../../lib/ui';
import type {
    PbxFieldCompareRow,
    PbxNormalizedItem,
} from '../../../lib/model/common';

/**
 * Сводка значений enum-поля: «синхронизировано/всего» по объединению
 * шаблон ∪ Bitrix ∪ БД. Янтарный цвет — есть рассинхрон (детали и точечные
 * операции — в диалоге «Подробнее»).
 */
function ItemsSummary({ items }: { items: PbxNormalizedItem[] }) {
    if (items.length === 0) return <span className="text-muted-foreground">—</span>;
    const synced = items.filter(
        (item) => item.inTemplate && item.inBitrix && item.inDb,
    ).length;
    const ok = synced === items.length;
    return (
        <span
            className={ok ? 'text-emerald-600' : 'text-amber-600'}
            title={
                ok
                    ? `Все ${items.length} значений синхронизированы`
                    : `${synced} из ${items.length} значений есть во всех трёх источниках — подробности в «Подробнее»`
            }
        >
            {synced}/{items.length}
        </span>
    );
}

interface PbxFieldsCompareTableProps {
    rows: PbxFieldCompareRow[];
    isLoading?: boolean;
    /** Show the select column + sync (only meaningful when a template exists). */
    selectable?: boolean;
    selectedCodes: Set<string>;
    onToggleSelect: (code: string) => void;
    onToggleSelectAll: (checked: boolean) => void;
    onOpenDetail: (row: PbxFieldCompareRow) => void;
    onDeleteField: (row: PbxFieldCompareRow) => void;
    /** Message for the empty state (e.g. "шаблон пуст"). */
    emptyMessage?: string;
}

export function PbxFieldsCompareTable({
    rows,
    isLoading,
    selectable = true,
    selectedCodes,
    onToggleSelect,
    onToggleSelectAll,
    onOpenDetail,
    onDeleteField,
    emptyMessage = 'Поля не найдены',
}: PbxFieldsCompareTableProps) {
    const selectableCodes = React.useMemo(
        () => rows.filter((r) => r.inTemplate).map((r) => r.code),
        [rows],
    );
    const allSelected =
        selectableCodes.length > 0 &&
        selectableCodes.every((code) => selectedCodes.has(code));

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
            </div>
        );
    }

    if (rows.length === 0) {
        return (
            <div className="flex items-center justify-center p-8 text-muted-foreground">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="rounded-md border overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        {selectable && (
                            <TableHead className="w-10">
                                <Checkbox
                                    checked={allSelected}
                                    onCheckedChange={(c) =>
                                        onToggleSelectAll(Boolean(c))
                                    }
                                    aria-label="Выбрать все шаблонные поля"
                                />
                            </TableHead>
                        )}
                        <TableHead className="w-40">Code</TableHead>
                        <TableHead className="w-56">Название</TableHead>
                        <TableHead className="w-24">Тип</TableHead>
                        <TableHead className="w-48">UF-имя (Bitrix)</TableHead>
                        <TableHead
                            className="w-24"
                            title="Значения enum-поля: синхронизировано / всего (шаблон ∪ Bitrix ∪ БД)"
                        >
                            Значения
                        </TableHead>
                        <TableHead className="w-40">Статус</TableHead>
                        <TableHead className="w-16 text-center">Шаблон</TableHead>
                        <TableHead className="w-16 text-center">Bitrix</TableHead>
                        <TableHead className="w-16 text-center">БД</TableHead>
                        <TableHead className="w-40">Действия</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((row) => {
                        const fullySynced =
                            row.inTemplate && row.inBitrix && row.inDb;
                        return (
                        <TableRow
                            key={row.code}
                            className={fullySynced ? 'bg-emerald-50/10' : undefined}
                        >
                            {selectable && (
                                <TableCell>
                                    <Checkbox
                                        checked={selectedCodes.has(row.code)}
                                        disabled={!row.inTemplate}
                                        onCheckedChange={() =>
                                            onToggleSelect(row.code)
                                        }
                                        aria-label={`Выбрать ${row.code}`}
                                    />
                                </TableCell>
                            )}
                            <TableCell
                                className="max-w-[10rem] cursor-pointer font-mono text-xs"
                                onClick={() => onOpenDetail(row)}
                            >
                                <div className="truncate" title={row.code}>
                                    {row.code}
                                </div>
                            </TableCell>
                            <TableCell
                                className="max-w-[14rem] cursor-pointer"
                                onClick={() => onOpenDetail(row)}
                            >
                                <div className="truncate" title={row.name}>
                                    {row.name}
                                </div>
                            </TableCell>
                            <TableCell className="max-w-[6rem]">
                                <div className="truncate" title={row.type ?? ''}>
                                    {row.type ?? '—'}
                                </div>
                            </TableCell>
                            <TableCell className="max-w-[12rem] font-mono text-xs">
                                <div
                                    className="truncate"
                                    title={row.installed?.bitrixName ?? ''}
                                >
                                    {row.installed?.bitrixName ?? '—'}
                                </div>
                            </TableCell>
                            <TableCell
                                className="cursor-pointer text-xs"
                                onClick={() => onOpenDetail(row)}
                            >
                                <ItemsSummary items={row.items} />
                            </TableCell>
                            <TableCell>
                                <FieldSyncStatus
                                    inTemplate={row.inTemplate}
                                    inBitrix={row.inBitrix}
                                    inDb={row.inDb}
                                />
                            </TableCell>
                            <TableCell className="text-center">
                                {selectable ? (
                                    <PresenceBadge present={row.inTemplate} />
                                ) : (
                                    <span
                                        className="text-muted-foreground"
                                        title="У этой сущности нет источника шаблона на бэке — сравнить с константами нельзя"
                                    >
                                        —
                                    </span>
                                )}
                            </TableCell>
                            <TableCell className="text-center">
                                <PresenceBadge present={row.inBitrix} />
                            </TableCell>
                            <TableCell className="text-center">
                                <PresenceBadge present={row.inDb} />
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onOpenDetail(row)}
                                    >
                                        Подробнее
                                    </Button>
                                    {(row.inBitrix || row.inDb) && (
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => onDeleteField(row)}
                                        >
                                            Удалить
                                        </Button>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
