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
import { PresenceBadge } from '../../../lib/ui';
import type { ListFieldRow } from '../../model';

/** Заголовок столбца с тултипом-пояснением статуса. */
function HeadWithHint({
    label,
    hint,
    className,
}: {
    label: string;
    hint: string;
    className?: string;
}) {
    return (
        <TableHead className={className}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span className="cursor-help underline decoration-dotted">
                        {label}
                    </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">{hint}</TooltipContent>
            </Tooltip>
        </TableHead>
    );
}

/**
 * CODE свойства: эталонный (fullCode) против фактического в Bitrix.
 * Расхождение подсвечивается — «Синхронизировать» мигрирует CODE на эталонный.
 */
function CodeCell({ row }: { row: ListFieldRow }) {
    const matchesTemplate =
        row.bitrixCode !== null &&
        row.bitrixCode?.toLowerCase() === row.fullCode?.toLowerCase();
    return (
        <div className="font-mono text-xs">
            <div>{row.fullCode}</div>
            {row.inBitrix && !matchesTemplate && (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="cursor-help text-amber-600">
                            в Bitrix: {row.bitrixCode || '—'}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                        Фактический CODE свойства отличается от эталонного.
                        «Синхронизировать» обновит CODE на эталонный.
                    </TooltipContent>
                </Tooltip>
            )}
        </div>
    );
}

/** Пара «метка: значение» в панели деталей. */
function DetailLine({
    label,
    value,
}: {
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="flex gap-1">
            <span className="text-muted-foreground">{label}:</span>
            <span className="font-mono">{value ?? '—'}</span>
        </div>
    );
}

/**
 * Детали поля с трёх сторон: эталон (шаблон) × Bitrix (свойство) × PortalDB
 * (зеркало). Показывает и items enum-полей со значениями и id.
 */
function FieldDetails({ row }: { row: ListFieldRow }) {
    return (
        <div className="grid grid-cols-1 gap-4 p-3 text-xs md:grid-cols-3">
            <div className="space-y-1 rounded-md border p-3">
                <p className="font-semibold">Эталон (шаблон)</p>
                <DetailLine label="name" value={row.name} />
                <DetailLine label="code" value={row.fullCode} />
                <DetailLine label="type" value={row.type} />
                {row.templateItems.length > 0 && (
                    <div>
                        <p className="mt-2 text-muted-foreground">
                            items ({row.templateItems.length}):
                        </p>
                        <ul className="ml-4 list-disc">
                            {row.templateItems.map((item) => (
                                <li key={item.code}>
                                    {item.value}{' '}
                                    <span className="font-mono text-muted-foreground">
                                        ({item.code}, sort {item.sort})
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <div className="space-y-1 rounded-md border p-3">
                <p className="font-semibold">Bitrix</p>
                {row.bitrix ? (
                    <>
                        <DetailLine label="FIELD_ID" value={row.bitrix.fieldId} />
                        <DetailLine label="CODE" value={row.bitrix.code} />
                        <DetailLine label="name" value={row.bitrix.name} />
                        <DetailLine label="type" value={row.bitrix.type} />
                        <DetailLine
                            label="multiple"
                            value={row.bitrix.multiple ? 'Да' : 'Нет'}
                        />
                        <DetailLine
                            label="required"
                            value={row.bitrix.isRequired ? 'Да' : 'Нет'}
                        />
                        <DetailLine label="sort" value={row.bitrix.sort} />
                        {row.bitrix.items.length > 0 && (
                            <div>
                                <p className="mt-2 text-muted-foreground">
                                    items ({row.bitrix.items.length}):
                                </p>
                                <ul className="ml-4 list-disc">
                                    {row.bitrix.items.map((item) => (
                                        <li key={item.id}>
                                            {item.value}{' '}
                                            <span className="font-mono text-muted-foreground">
                                                (id {item.id})
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </>
                ) : (
                    <p className="text-muted-foreground">
                        Свойство не найдено в инфоблоке.
                    </p>
                )}
            </div>

            <div className="space-y-1 rounded-md border p-3">
                <p className="font-semibold">PortalDB</p>
                {row.db ? (
                    <>
                        <DetailLine label="id" value={row.db.id} />
                        <DetailLine label="code" value={row.db.code} />
                        <DetailLine label="bitrixId" value={row.db.bitrixId} />
                        <DetailLine
                            label="bitrixCamelId"
                            value={row.db.bitrixCamelId}
                        />
                        <DetailLine label="type" value={row.db.type} />
                        <DetailLine
                            label="isPlural"
                            value={row.db.isPlural ? 'Да' : 'Нет'}
                        />
                        {row.db.items.length > 0 && (
                            <div>
                                <p className="mt-2 text-muted-foreground">
                                    items ({row.db.items.length}):
                                </p>
                                <ul className="ml-4 list-disc">
                                    {row.db.items.map((item) => (
                                        <li key={`${item.code}_${item.bitrixId}`}>
                                            {item.name}{' '}
                                            <span className="font-mono text-muted-foreground">
                                                ({item.code}, bitrixId{' '}
                                                {item.bitrixId})
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </>
                ) : (
                    <p className="text-muted-foreground">
                        Зеркала в `bitrixfields` нет — интеграции это поле не
                        увидят.
                    </p>
                )}
            </div>
        </div>
    );
}

/**
 * Таблица полей одного списка: эталон × Bitrix (свойства инфоблока,
 * `lists.field.*`) × PortalDB (`bitrixfields`, entity_type=BITRIX_LIST).
 * Строка разворачивается в детали с items трёх источников.
 */
export function ListFieldsTable({
    rows,
    onSync,
    onDelete,
    syncing,
    deleting,
    canSync,
}: {
    rows: ListFieldRow[];
    /** Выровнять поле по эталону (создать/обновить в Bitrix + зеркало в БД). */
    onSync: (row: ListFieldRow) => void;
    onDelete: (row: ListFieldRow) => void;
    syncing?: boolean;
    deleting?: boolean;
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
                            hint="Эталонный CODE свойства (`группа_тип_код`, легаси-конвенция). Если фактический CODE в Bitrix отличается — показан ниже и подсвечен."
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
                                        <FieldDetails row={row} />
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