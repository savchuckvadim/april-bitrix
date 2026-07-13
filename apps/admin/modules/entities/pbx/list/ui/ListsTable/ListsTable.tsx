'use client';

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
import type { ListRow } from '../../model';

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
 * Таблица списков: эталон × Bitrix (инфоблоки `lists.*`) × PortalDB
 * (`bitrixlists`). Список адресуется парой type + group.
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
                        <HeadWithHint
                            label="Тип / группа"
                            hint="Ключ списка в нашей БД (`bitrixlists.type` + `group`). По нему список резолвится во всех операциях."
                            className="w-40"
                        />
                        <TableHead>Имя</TableHead>
                        <HeadWithHint
                            label="Код"
                            hint="IBLOCK_CODE из Excel-шаблона. Существующий список в Bitrix ищется по кандидатам: код шаблона, `группа_тип`, `тип` — дубликаты не создаются."
                            className="w-36"
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
                        <TableHead className="w-24">Bitrix ID</TableHead>
                        <TableHead className="w-40">Действия</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((row) => (
                        <TableRow key={`${row.group}_${row.type}`}>
                            <TableCell className="font-mono text-xs">
                                {row.type} / {row.group}
                            </TableCell>
                            <TableCell className="font-medium">{row.name}</TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                                {row.code}
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
                                {row.bitrixId ?? '—'}
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
                                                    onClick={() => onSync(row)}
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
                                                    onClick={() => onDelete(row)}
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
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}