'use client';

import React from 'react';
import { Check, ChevronDown, Eraser } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { cn } from '@workspace/ui/lib/utils';
import type { PbxFieldCode } from '../model';
import { pbxItemClasses } from '../lib/pbx-item-colors';
import { usePbxSelect } from '../hooks/use-pbx-select';
import { PbxFieldStatusBadge } from './PbxFieldStatusBadge';
import { PbxFieldConfirmDialog } from './PbxFieldConfirmDialog';

interface PbxFieldSelectBadgeProps {
    fieldCode: PbxFieldCode;
    entityId: number;
    /** Значение из DTO отчёта (code элемента) — база для optimistic. */
    value: string | null;
    /**
     * Готовое имя значения из DTO (live-словарь бэка) — фолбэк, если
     * элемент не найден в meta.items (например мета ещё грузится).
     */
    valueLabel?: string | null;
    /** Плейсхолдер пустого значения. */
    emptyLabel?: string;
}

/**
 * Enum-поле бэйджем: цветной бэйдж текущего элемента, по клику — выпадающий
 * список элементов портала. Поля с confirm — через диалог подтверждения;
 * рядом микро-бейдж статуса сейва. На /share и без меты — статичный бэйдж.
 */
export const PbxFieldSelectBadge: React.FC<PbxFieldSelectBadgeProps> = ({
    fieldCode,
    entityId,
    value,
    valueLabel,
    emptyLabel = '—',
}) => {
    const select = usePbxSelect(fieldCode, entityId, value);
    const classes = pbxItemClasses(select.value, select.itemIndex);
    const label =
        select.item?.name ??
        (select.value === value ? valueLabel : null) ??
        select.value ??
        emptyLabel;

    const badge = (
        <span
            className={cn(
                'inline-flex max-w-[180px] items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
                classes.badge,
                select.canEdit && 'cursor-pointer',
            )}
        >
            <span className="truncate">{label}</span>
            {select.canEdit && (
                <ChevronDown className="h-3 w-3 shrink-0 opacity-60" />
            )}
        </span>
    );

    if (!select.canEdit) {
        return (
            <span className="inline-flex items-center gap-1">{badge}</span>
        );
    }

    return (
        <span
            className="inline-flex items-center gap-1"
            onClick={event => event.stopPropagation()}
        >
            <DropdownMenu>
                <DropdownMenuTrigger asChild>{badge}</DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[200px]">
                    {(select.meta?.items ?? []).map((item, index) => {
                        const itemClasses = pbxItemClasses(item.code, index);
                        const isCurrent = item.code === select.value;
                        return (
                            <DropdownMenuItem
                                key={item.code}
                                onSelect={() => select.pick(item.code)}
                                className="gap-2 text-xs"
                            >
                                <span
                                    className={cn(
                                        'h-2.5 w-2.5 shrink-0 rounded-full',
                                        itemClasses.dot,
                                    )}
                                />
                                <span className="flex-1">{item.name}</span>
                                {isCurrent && (
                                    <Check className="h-3 w-3 shrink-0" />
                                )}
                            </DropdownMenuItem>
                        );
                    })}
                    {select.value !== null && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onSelect={() => select.pick(null)}
                                className="gap-2 text-xs text-muted-foreground"
                            >
                                <Eraser className="h-3 w-3 shrink-0" />
                                Очистить
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
            <PbxFieldStatusBadge edit={select.edit} />
            <PbxFieldConfirmDialog
                open={select.isConfirmOpen}
                fieldName={select.meta?.name ?? fieldCode}
                fromLabel={select.pendingFromLabel}
                toLabel={select.pendingToLabel}
                onConfirm={select.confirmPending}
                onCancel={select.cancelPending}
            />
        </span>
    );
};
