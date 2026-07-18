'use client';

import { Pencil, Trash2 } from 'lucide-react';
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
import { HeadWithHint, PresenceBadge } from '../../../../lib/ui';
import type { ItemMatrixRow } from '../../../lib/items-matrix';

/** Значение источника или маркер отсутствия. */
function SourceValue({
    value,
    detail,
    drift,
}: {
    value: string | null;
    detail: string | null;
    drift: boolean;
}) {
    if (value === null) {
        return <span className="text-muted-foreground">—</span>;
    }
    return (
        <div>
            <span className={drift ? 'text-amber-600' : undefined}>
                {value}
            </span>
            {detail && (
                <div className="font-mono text-[10px] text-muted-foreground">
                    {detail}
                </div>
            )}
        </div>
    );
}

/**
 * Матрица значений enum-поля: эталон × Bitrix × PortalDB, смерженные по code.
 * Расхождения значений подсвечены; точечные операции (переименовать/удалить)
 * идут через PortalDB-зеркало, поэтому доступны только для items с зеркалом.
 */
export function ItemsMatrix({
    rows,
    onEdit,
    onDelete,
    busy,
}: {
    rows: ItemMatrixRow[];
    /** Переименовать значение (PortalDB + Bitrix). */
    onEdit: (row: ItemMatrixRow) => void;
    /** Удалить значение (PortalDB + Bitrix). */
    onDelete: (row: ItemMatrixRow) => void;
    busy?: boolean;
}) {
    if (rows.length === 0) return null;

    return (
        <div className="overflow-x-auto rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <HeadWithHint
                            label="code"
                            hint="Стабильный код значения (эталон/`bitrixfield_items.code`). «—» — значение найдено только в Bitrix и коду не сопоставлено."
                            className="w-36"
                        />
                        <HeadWithHint
                            label="Эталон"
                            hint="Значение из Excel-шаблона (value + sort)."
                        />
                        <HeadWithHint
                            label="Bitrix"
                            hint="Фактическое VALUE enum-свойства в Bitrix (+ ID значения)."
                        />
                        <HeadWithHint
                            label="PortalDB"
                            hint="Зеркало значения в `bitrixfield_items` (+ сохранённый bitrixId — по нему выполняется точечный update в Bitrix)."
                        />
                        <HeadWithHint
                            label="Синхр."
                            hint="Значение есть во всех трёх источниках и отображаемые значения совпадают."
                            className="w-20 text-center"
                        />
                        <TableHead className="w-28">Действия</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((row, i) => {
                        const canMutate = !!row.code && !!row.db;
                        return (
                            <TableRow key={row.code ?? `bx_${row.bitrix?.id ?? i}`}>
                                <TableCell className="font-mono text-xs">
                                    {row.code ?? '—'}
                                </TableCell>
                                <TableCell className="text-xs">
                                    <SourceValue
                                        value={row.template?.value ?? null}
                                        detail={
                                            row.template
                                                ? `sort ${row.template.sort}`
                                                : null
                                        }
                                        drift={row.valueDrift}
                                    />
                                </TableCell>
                                <TableCell className="text-xs">
                                    <SourceValue
                                        value={row.bitrix?.value ?? null}
                                        detail={
                                            row.bitrix
                                                ? `id ${row.bitrix.id}`
                                                : null
                                        }
                                        drift={row.valueDrift}
                                    />
                                </TableCell>
                                <TableCell className="text-xs">
                                    <SourceValue
                                        value={row.db?.name ?? null}
                                        detail={
                                            row.db
                                                ? `bitrixId ${row.db.bitrixId}`
                                                : null
                                        }
                                        drift={row.valueDrift}
                                    />
                                </TableCell>
                                <TableCell className="text-center">
                                    <PresenceBadge present={row.inSync} />
                                </TableCell>
                                <TableCell>
                                    {canMutate ? (
                                        <div className="flex gap-1">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-7 w-7 p-0"
                                                        disabled={busy}
                                                        onClick={() =>
                                                            onEdit(row)
                                                        }
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-xs">
                                                    Переименовать значение в
                                                    Bitrix и PortalDB (code
                                                    останется прежним).
                                                </TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-7 w-7 p-0 text-destructive"
                                                        disabled={busy}
                                                        onClick={() =>
                                                            onDelete(row)
                                                        }
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-xs">
                                                    Удалить значение в Bitrix и
                                                    PortalDB.
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    ) : (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span className="cursor-help text-xs text-muted-foreground">
                                                    —
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-xs">
                                                Точечные операции доступны только
                                                для значений с зеркалом в
                                                PortalDB — сначала
                                                синхронизируйте поле.
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
