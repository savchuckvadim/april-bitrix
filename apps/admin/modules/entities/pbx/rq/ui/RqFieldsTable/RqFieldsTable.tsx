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
import type { RqFieldRow } from '../../model';

/**
 * Таблица пользовательских полей реквизита: эталон × Bitrix
 * (`crm.requisite.userfield.list`). Поля нужны в определённом виде для
 * договоров — например «Должность (в лице)» в родительном падеже.
 */
export function RqFieldsTable({
    rows,
    onDelete,
    onSync,
    deleting,
    syncing,
    canSync,
}: {
    rows: RqFieldRow[];
    onDelete: (row: RqFieldRow) => void;
    /** Создать недостающее поле в Bitrix по эталону. */
    onSync: (row: RqFieldRow) => void;
    deleting?: boolean;
    syncing?: boolean;
    /** Есть ли в строке соответствующий эталонный шаблон (parse загружен). */
    canSync: (row: RqFieldRow) => boolean;
}) {
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
                        <TableHead className="w-48">XML_ID</TableHead>
                        <TableHead>Подпись</TableHead>
                        <TableHead className="w-24 text-center">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="cursor-help underline decoration-dotted">
                                        В Bitrix
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                    Поле реквизита существует в Bitrix
                                    (`crm.requisite.userfield.list`).
                                </TooltipContent>
                            </Tooltip>
                        </TableHead>
                        <TableHead className="w-56">FIELD_NAME</TableHead>
                        <TableHead className="w-20">ID</TableHead>
                        <TableHead className="w-28">Действия</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((row) => (
                        <TableRow key={row.xmlId}>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                                {row.xmlId}
                            </TableCell>
                            <TableCell className="font-medium">{row.label}</TableCell>
                            <TableCell className="text-center">
                                <PresenceBadge present={row.inBitrix} />
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                                {row.fieldName != null ? String(row.fieldName) : '—'}
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                                {row.fieldId ?? '—'}
                            </TableCell>
                            <TableCell>
                                {row.inBitrix && row.fieldId ? (
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
                                            Удаляет поле в Bitrix
                                            (`crm.requisite.userfield.delete`) по id{' '}
                                            {row.fieldId}.
                                        </TooltipContent>
                                    </Tooltip>
                                ) : canSync(row) ? (
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
                                            Создаёт поле в Bitrix по эталону
                                            (`crm.requisite.userfield.add`).
                                        </TooltipContent>
                                    </Tooltip>
                                ) : (
                                    <span className="text-xs text-muted-foreground">
                                        —
                                    </span>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
