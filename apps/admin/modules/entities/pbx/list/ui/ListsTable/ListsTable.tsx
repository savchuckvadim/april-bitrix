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
import type { ListRow } from '../../model';
import { ListDetails } from '../ListDetails';
import { ListCodeCell } from './components/ListCodeCell';

/**
 * Таблица списков: эталон × Bitrix (инфоблоки `lists.*`) × PortalDB
 * (`bitrixlists`). Список адресуется парой type + group. Строка
 * разворачивается в детали инфоблока с трёх сторон.
 */
export function ListsTable({
    rows,
    onSync,
    onDelete,
    syncing,
    deleting,
}: {
    rows: ListRow[];
    /** Выровнять список по эталону (инфоблок + поля + зеркало в БД). */
    onSync: (row: ListRow) => void;
    onDelete: (row: ListRow) => void;
    syncing?: boolean;
    deleting?: boolean;
}) {
    const [expandedKey, setExpandedKey] = React.useState<string | null>(null);

    if (rows.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">Списков не найдено.</p>
        );
    }

    return (
        <div className="overflow-x-auto rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-8" />
                        <HeadWithHint
                            label="Тип / группа"
                            hint="Ключ списка в нашей БД (`bitrixlists.type` + `group`). По нему список резолвится во всех операциях."
                            className="w-40"
                        />
                        <TableHead>Имя</TableHead>
                        <HeadWithHint
                            label="Код"
                            hint="IBLOCK_CODE из Excel-шаблона. Ниже — фактический CODE инфоблока в Bitrix и code в БД `bitrixlists`, если отличаются. Существующий список ищется по кандидатам: код шаблона, `группа_тип`, `тип` — дубликаты не создаются."
                            className="w-40"
                        />
                        <HeadWithHint
                            label="В Bitrix"
                            hint="Инфоблок существует в Bitrix (`lists.get`)."
                            className="w-24 text-center"
                        />
                        <HeadWithHint
                            label="В БД"
                            hint="Есть зеркало в PortalDB `bitrixlists` с записанным IBLOCK_ID."
                            className="w-24 text-center"
                        />
                        <HeadWithHint
                            label="Синхр."
                            hint="IBLOCK_ID в Bitrix и в БД совпадают — состояние консистентно."
                            className="w-24 text-center"
                        />
                        <HeadWithHint
                            label="Bitrix ID"
                            hint="IBLOCK_ID инфоблока в Bitrix. Ниже — значение, сохранённое в БД `bitrixlists`, если отличается."
                            className="w-24"
                        />
                        <TableHead className="w-40">Действия</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((row) => {
                        const key = `${row.group}_${row.type}`;
                        return (
                            <React.Fragment key={key}>
                                <TableRow>
                                    <TableCell>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-6 w-6 p-0"
                                            onClick={() =>
                                                setExpandedKey(
                                                    expandedKey === key
                                                        ? null
                                                        : key,
                                                )
                                            }
                                        >
                                            {expandedKey === key ? (
                                                <ChevronDown className="h-4 w-4" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">
                                        {row.type} / {row.group}
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
                                        <ListCodeCell row={row} />
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
                                        <div>{row.bitrixId ?? '—'}</div>
                                        {row.dbBitrixId !== null &&
                                            row.dbBitrixId !== row.bitrixId && (
                                                <div className="text-amber-600">
                                                    в БД: {row.dbBitrixId}
                                                </div>
                                            )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-2">
                                            {!row.inSync && (
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
                                                        Устанавливает список по шаблону: инфоблок
                                                        в Bitrix (`lists.add`/`lists.update`),
                                                        поля и зеркало в `bitrixlists`.
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
                                                        Удаляет зеркало из PortalDB (строку
                                                        `bitrixlists` и её поля); по выбору —
                                                        и инфоблок в Bitrix (`lists.delete`).
                                                    </TooltipContent>
                                                </Tooltip>
                                            ) : row.inSync ? (
                                                <span className="text-xs text-muted-foreground">
                                                    —
                                                </span>
                                            ) : null}
                                        </div>
                                    </TableCell>
                                </TableRow>
                                {expandedKey === key && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={9}
                                            className="bg-muted/30 p-0"
                                        >
                                            <ListDetails row={row} />
                                        </TableCell>
                                    </TableRow>
                                )}
                            </React.Fragment>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
