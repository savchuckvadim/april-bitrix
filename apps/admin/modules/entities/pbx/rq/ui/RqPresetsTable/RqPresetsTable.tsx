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
import { Input } from '@workspace/ui/components/input';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { PresenceBadge } from '../../../lib/ui';
import type { RqPresetRow } from '../../model';

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
 * Таблица пресетов реквизита: эталон × Bitrix × PortalDB (`bx_rqs`).
 * Пресет — это id, записанный в нашей БД и помеченный бизнес-кодом (типом).
 */
export function RqPresetsTable({
    rows,
    onDelete,
    onSync,
    onSetBitrixId,
    deleting,
    syncing,
    settingBitrixId,
    canSync,
}: {
    rows: RqPresetRow[];
    onDelete: (row: RqPresetRow) => void;
    /** Выровнять пресет по эталону (подхватить существующий в Bitrix / создать). */
    onSync: (row: RqPresetRow) => void;
    /** Привязать bitrixId к строке `bx_rqs` вручную (Bitrix не меняется). */
    onSetBitrixId: (row: RqPresetRow, bitrixId: number) => void;
    deleting?: boolean;
    syncing?: boolean;
    settingBitrixId?: boolean;
    /** Есть ли эталонный шаблон для строки (parse загружен). */
    canSync: (row: RqPresetRow) => boolean;
}) {
    const [editingCode, setEditingCode] = React.useState<string | null>(null);
    const [draft, setDraft] = React.useState('');

    const startEdit = (row: RqPresetRow) => {
        setEditingCode(row.code);
        setDraft(String(row.dbBitrixId ?? row.bitrixId ?? ''));
    };

    const submitEdit = (row: RqPresetRow) => {
        const bitrixId = Number(draft);
        if (!Number.isInteger(bitrixId) || bitrixId < 1) return;
        onSetBitrixId(row, bitrixId);
        setEditingCode(null);
    };

    if (rows.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">Пресетов не найдено.</p>
        );
    }

    return (
        <div className="overflow-x-auto rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <HeadWithHint
                            label="Код / тип"
                            hint="Бизнес-код пресета (org / ip / fiz). Стабильный идентификатор разреза реквизитов в нашей БД."
                            className="w-32"
                        />
                        <TableHead>Имя</TableHead>
                        <TableHead className="w-48">XML_ID</TableHead>
                        <HeadWithHint
                            label="В Bitrix"
                            hint="Пресет существует в Bitrix (`crm.requisite.preset.list`)."
                            className="w-24 text-center"
                        />
                        <HeadWithHint
                            label="В БД"
                            hint="Есть зеркало в PortalDB `bx_rqs` с записанным bitrix_id."
                            className="w-24 text-center"
                        />
                        <HeadWithHint
                            label="Синхр."
                            hint="bitrix_id в Bitrix и в БД совпадают — состояние консистентно."
                            className="w-24 text-center"
                        />
                        <HeadWithHint
                            label="Bitrix ID"
                            hint="ID пресета в Bitrix. Можно привязать вручную — запишется в `bx_rqs`, в Bitrix ничего не изменится."
                            className="w-40"
                        />
                        <TableHead className="w-28">Действия</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((row) => (
                        <TableRow key={row.xmlId}>
                            <TableCell className="font-mono text-xs">
                                {row.code}
                            </TableCell>
                            <TableCell className="font-medium">{row.name}</TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                                {row.xmlId}
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
                                {editingCode === row.code ? (
                                    <div className="flex items-center gap-1">
                                        <Input
                                            type="number"
                                            min={1}
                                            className="h-8 w-20"
                                            value={draft}
                                            autoFocus
                                            onChange={(e) =>
                                                setDraft(e.target.value)
                                            }
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter')
                                                    submitEdit(row);
                                                if (e.key === 'Escape')
                                                    setEditingCode(null);
                                            }}
                                        />
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={
                                                settingBitrixId ||
                                                !Number.isInteger(
                                                    Number(draft),
                                                ) ||
                                                Number(draft) < 1
                                            }
                                            onClick={() => submitEdit(row)}
                                        >
                                            ОК
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() =>
                                                setEditingCode(null)
                                            }
                                        >
                                            ✕
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1">
                                        <span>{row.bitrixId ?? '—'}</span>
                                        {row.dbBitrixId != null &&
                                            row.dbBitrixId !== row.bitrixId && (
                                                <span className="text-muted-foreground">
                                                    БД: {row.dbBitrixId}
                                                </span>
                                            )}
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    disabled={settingBitrixId}
                                                    onClick={() =>
                                                        startEdit(row)
                                                    }
                                                >
                                                    Изм.
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-xs">
                                                Привязать существующий пресет
                                                Bitrix по id: значение
                                                запишется в `bx_rqs`, в Bitrix
                                                ничего не создаётся и не
                                                меняется.
                                            </TooltipContent>
                                        </Tooltip>
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
                                                    onClick={() => onSync(row)}
                                                >
                                                    Синхронизировать
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-xs">
                                                Выравнивает пресет по эталону:
                                                подхватывает существующий пресет в
                                                Bitrix (по привязке из БД / имени) или
                                                создаёт новый и пишет зеркало в
                                                `bx_rqs`.
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                    {row.inBitrix && row.bitrixId ? (
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
                                                Удаляет пресет в Bitrix
                                                (`crm.requisite.preset.delete`) по
                                                bitrix-id {row.bitrixId}. Зеркало в БД
                                                остаётся.
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
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
