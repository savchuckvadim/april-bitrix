'use client';

import * as React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
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
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { HeadWithHint, PresenceBadge } from '../../../lib/ui';
import type { ItemMatrixRow } from '../../lib/items-matrix';
import type { ListFieldRow } from '../../model';
import { FieldDetails } from '../FieldDetails';
import { CodeCell } from './components/CodeCell';

/**
 * Таблица полей одного списка: эталон × Bitrix (свойства инфоблока,
 * `lists.field.*`) × PortalDB (`bitrixfields`, entity_type=BITRIX_LIST).
 * Строка разворачивается в детали с матрицей items трёх источников.
 */
export function ListFieldsTable({
    rows,
    onSync,
    onDelete,
    onEditItem,
    onDeleteItem,
    syncing,
    deleting,
    itemsBusy,
    canSync,
}: {
    rows: ListFieldRow[];
    /** Выровнять поле по эталону (создать/обновить в Bitrix + зеркало в БД). */
    onSync: (row: ListFieldRow) => void;
    onDelete: (row: ListFieldRow) => void;
    /** Переименовать значение enum-поля (PortalDB + Bitrix). */
    onEditItem: (row: ListFieldRow, item: ItemMatrixRow) => void;
    /** Удалить значение enum-поля (PortalDB + Bitrix). */
    onDeleteItem: (row: ListFieldRow, item: ItemMatrixRow) => void;
    syncing?: boolean;
    deleting?: boolean;
    /** Идёт операция над значением enum-поля. */
    itemsBusy?: boolean;
    /** Есть ли эталонный шаблон для строки (parse загружен). */
    canSync: (row: ListFieldRow) => boolean;
}) {
    const [expandedCode, setExpandedCode] = React.useState<string | null>(null);

    if (rows.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">Полей не найдено.</p>
        );
    }

    return (
        <div className="overflow-x-auto rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-8" />
                        <TableHead>Название</TableHead>
                        <HeadWithHint
                            label="CODE"
                            hint="Эталонный CODE свойства (`группа_тип_код`, легаси-конвенция). Если фактический CODE в Bitrix или в БД отличается — показан ниже и подсвечен."
                            className="w-56"
                        />
                        <HeadWithHint
                            label="Тип"
                            hint="Тип из эталона и фактический тип свойства в Bitrix (S, N, L, S:DateTime, S:ECrm…). «×N» — множественное."
                            className="w-36"
                        />
                        <HeadWithHint
                            label="В Bitrix"
                            hint="Свойство найдено в инфоблоке (`lists.field.get`) по одному из кандидатов CODE."
                            className="w-24 text-center"
                        />
                        <HeadWithHint
                            label="В БД"
                            hint="Есть зеркало в PortalDB `bitrixfields` (по нему интеграции пишут в список)."
                            className="w-24 text-center"
                        />
                        <HeadWithHint
                            label="Синхр."
                            hint="FIELD_ID (PROPERTY_N) в Bitrix и в БД совпадают — интеграции пишут в правильное свойство."
                            className="w-24 text-center"
                        />
                        <HeadWithHint
                            label="FIELD_ID"
                            hint="Идентификатор свойства в Bitrix (PROPERTY_N). Его интеграции передают в lists.element.add. Ниже — значение, сохранённое в БД, если отличается."
                            className="w-36"
                        />
                        <TableHead className="w-40">Действия</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((row) => (
                        <React.Fragment key={row.code}>
                            <TableRow>
                                <TableCell>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 w-6 p-0"
                                        onClick={() =>
                                            setExpandedCode(
                                                expandedCode === row.code
                                                    ? null
                                                    : row.code,
                                            )
                                        }
                                    >
                                        {expandedCode === row.code ? (
                                            <ChevronDown className="h-4 w-4" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4" />
                                        )}
                                    </Button>
                                </TableCell>
                                <TableCell className="font-medium">
                                    <div>{row.name}</div>
                                    {row.bitrixName !== null &&
                                        row.bitrixName !== row.name && (
                                            <div className="text-xs text-muted-foreground">
                                                в Bitrix: {row.bitrixName}
                                            </div>
                                        )}
                                </TableCell>
                                <TableCell>
                                    <CodeCell row={row} />
                                </TableCell>
                                <TableCell className="font-mono text-xs">
                                    <div>{row.type}</div>
                                    {row.bitrixType !== null && (
                                        <div className="text-muted-foreground">
                                            {row.bitrixType}
                                            {row.bitrixMultiple ? ' ×N' : ''}
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="text-center">
                                    <PresenceBadge present={row.inBitrix} />
                                </TableCell>
                                <TableCell className="text-center">
                                    <PresenceBadge present={row.inDb} />
                                </TableCell>
                                <TableCell className="text-center">
                                    <PresenceBadge present={row.inSync} />
                                </TableCell>
                                <TableCell className="font-mono text-xs">
                                    <div>{row.fieldId ?? '—'}</div>
                                    {row.dbFieldId !== null &&
                                        row.dbFieldId !== row.fieldId && (
                                            <div className="text-amber-600">
                                                в БД: {row.dbFieldId}
                                            </div>
                                        )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-2">
                                        {!row.inSync && canSync(row) && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        disabled={syncing}
                                                        onClick={() =>
                                                            onSync(row)
                                                        }
                                                    >
                                                        Синхронизировать
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-xs">
                                                    Устанавливает поле по эталону:
                                                    `lists.field.add`/`update` в
                                                    Bitrix (CODE мигрирует на
                                                    эталонный, тип и множественность
                                                    существующего поля не меняются)
                                                    и зеркало в `bitrixfields`.
                                                </TooltipContent>
                                            </Tooltip>
                                        )}
                                        {row.inDb ? (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-destructive"
                                                        disabled={deleting}
                                                        onClick={() =>
                                                            onDelete(row)
                                                        }
                                                    >
                                                        Удалить
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-xs">
                                                    Удаляет поле в Bitrix
                                                    (`lists.field.delete`) и его
                                                    зеркало в PortalDB.
                                                </TooltipContent>
                                            </Tooltip>
                                        ) : !row.inSync && canSync(row) ? null : (
                                            <span className="text-xs text-muted-foreground">
                                                —
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                            {expandedCode === row.code && (
                                <TableRow>
                                    <TableCell
                                        colSpan={9}
                                        className="bg-muted/30 p-0"
                                    >
                                        <FieldDetails
                                            row={row}
                                            itemsBusy={itemsBusy}
                                            onEditItem={(item) =>
                                                onEditItem(row, item)
                                            }
                                            onDeleteItem={(item) =>
                                                onDeleteItem(row, item)
                                            }
                                        />
                                    </TableCell>
                                </TableRow>
                            )}
                        </React.Fragment>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
