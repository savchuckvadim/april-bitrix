'use client';

import React from 'react';
import { CalendarDays } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@workspace/ui/components/popover';
import { Calendar } from '@workspace/ui/components/calendar';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import type { PbxFieldCode } from '../model';
import { usePbxDate } from '../hooks/use-pbx-date';
import { PbxFieldStatusBadge } from './PbxFieldStatusBadge';

interface PbxFieldDateCellProps {
    fieldCode: PbxFieldCode;
    entityId: number;
    /** Значение из DTO отчёта (ISO) — база для optimistic. */
    value: string | null;
    /** Плейсхолдер пустого значения. */
    emptyLabel?: string;
}

/**
 * Date-поле: значение dd.MM.yyyy, по клику попап с календарём и явными
 * кнопками «Сохранить»/«Очистить» — explicit commit и есть подтверждение
 * изменения (даты влияют на финансовые расчёты). Микро-бейдж статуса рядом.
 */
export const PbxFieldDateCell: React.FC<PbxFieldDateCellProps> = ({
    fieldCode,
    entityId,
    value,
    emptyLabel = '—',
}) => {
    const date = usePbxDate(fieldCode, entityId, value);
    const label = date.displayValue ?? emptyLabel;

    if (!date.canEdit) {
        return <span className="text-xs">{label}</span>;
    }

    return (
        <span
            className="inline-flex items-center gap-1"
            onClick={event => event.stopPropagation()}
        >
            <Popover open={date.isOpen} onOpenChange={date.setOpen}>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        className={cn(
                            'inline-flex cursor-pointer items-center gap-1 text-xs',
                            'text-primary underline-offset-2 hover:underline',
                            !date.displayValue && 'text-muted-foreground',
                        )}
                    >
                        <CalendarDays className="h-3 w-3 shrink-0 opacity-60" />
                        {label}
                    </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-2">
                    <Calendar
                        mode="single"
                        selected={date.draft}
                        onSelect={date.setDraft}
                        defaultMonth={date.draft}
                    />
                    <div className="mt-2 flex items-center justify-between gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-muted-foreground"
                            onClick={date.clear}
                        >
                            Очистить
                        </Button>
                        <Button
                            size="sm"
                            className="h-7 px-3 text-xs"
                            disabled={!date.draft}
                            onClick={date.commit}
                        >
                            Сохранить
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
            <PbxFieldStatusBadge edit={date.edit} />
        </span>
    );
};
