'use client';

import * as React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { SmartResponseDto } from '@workspace/nest-admin-api';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { TableCell, TableRow } from '@workspace/ui/components/table';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { SmartDetailsPanel } from '../../SmartDetailsPanel';

/**
 * Строка таблицы смартов: клик по строке или шеврону разворачивает панель
 * деталей (лениво, с кэшем по id). Действия — «Открыть» (страница процесса)
 * и «Установить полностью» (по эталону, если смарт из эталонного набора).
 */
export function DbSmartRow({
    smart,
    expanded,
    onToggle,
    onOpen,
    showInstall,
    installDisabled,
    installing,
    onInstall,
}: {
    smart: SmartResponseDto;
    expanded: boolean;
    onToggle: () => void;
    onOpen: () => void;
    /** Показывать ли «Установить полностью» (name/group из эталонного набора). */
    showInstall: boolean;
    installDisabled: boolean;
    installing: boolean;
    onInstall: () => void;
}) {
    return (
        <React.Fragment>
            <TableRow className="cursor-pointer" onClick={onToggle}>
                <TableCell>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        {expanded ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )}
                    </Button>
                </TableCell>
                <TableCell className="font-medium">
                    <div>{smart.name}</div>
                    <div className="text-xs text-muted-foreground">
                        {smart.title}
                    </div>
                </TableCell>
                <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                        {smart.type}
                    </Badge>
                </TableCell>
                <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                        {smart.group}
                    </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs">
                    {smart.entityTypeId}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-wrap gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={onOpen}
                                >
                                    Открыть
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                                Страница процесса «{smart.name}» (
                                {smart.group}): поля и воронки/стадии именно
                                этого смарта.
                            </TooltipContent>
                        </Tooltip>
                        {showInstall && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size="sm"
                                        disabled={installDisabled}
                                        onClick={onInstall}
                                    >
                                        {installing
                                            ? 'Установка…'
                                            : 'Установить полностью'}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                    Полная установка по эталону: тип + поля +
                                    воронки/стадии в Bitrix с зеркалом в
                                    PortalDB. Повторный запуск обновляет, не
                                    плодя дубликаты.
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </div>
                </TableCell>
            </TableRow>
            {expanded && (
                <TableRow>
                    <TableCell colSpan={6} className="bg-muted/30 p-0">
                        <SmartDetailsPanel smartId={smart.id} />
                    </TableCell>
                </TableRow>
            )}
        </React.Fragment>
    );
}
