'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, CalendarRange } from 'lucide-react';

import { cn } from '@workspace/ui/lib/utils';
import { Button, buttonVariants } from '@workspace/ui/components/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@workspace/ui/components/popover';

const GRID_SIZE = 12; // 4 x 3 сетка годов

export interface YearRangePickerProps {
    startYear: number;
    endYear: number;
    onChange: (startYear: number, endYear: number) => void;
    /** Минимально допустимый год для выбора (по умолчанию без ограничения) */
    minYear?: number;
    /** Максимально допустимый год для выбора (по умолчанию без ограничения) */
    maxYear?: number;
    className?: string;
    /** Текст для значения в триггере, когда оба года совпадают (по умолчанию просто год) */
    placeholder?: string;
}

/** Первый год сетки из 12 лет, содержащей переданный год */
function getGridStart(year: number): number {
    return Math.floor(year / GRID_SIZE) * GRID_SIZE;
}

export function YearRangePicker({
    startYear,
    endYear,
    onChange,
    minYear,
    maxYear,
    className,
    placeholder,
}: YearRangePickerProps) {
    const [open, setOpen] = React.useState(false);
    // Первый год отображаемой сетки
    const [gridStart, setGridStart] = React.useState(() => getGridStart(startYear));
    // Год начала диапазона при выборе. null => следующий клик начинает новый диапазон
    const [pendingStart, setPendingStart] = React.useState<number | null>(null);
    const [hoveredYear, setHoveredYear] = React.useState<number | null>(null);

    // При открытии центрируем сетку на текущем начале диапазона и сбрасываем выбор
    React.useEffect(() => {
        if (open) {
            setGridStart(getGridStart(startYear));
            setPendingStart(null);
            setHoveredYear(null);
        }
    }, [open, startYear]);

    const years = React.useMemo(
        () => Array.from({ length: GRID_SIZE }, (_, i) => gridStart + i),
        [gridStart],
    );

    const isDisabled = (year: number) =>
        (minYear !== undefined && year < minYear) ||
        (maxYear !== undefined && year > maxYear);

    const handleSelect = (year: number) => {
        if (isDisabled(year)) return;

        if (pendingStart === null) {
            // Первый клик — фиксируем начало диапазона
            setPendingStart(year);
            return;
        }

        // Второй клик — фиксируем конец и нормализуем порядок
        const start = Math.min(pendingStart, year);
        const end = Math.max(pendingStart, year);
        onChange(start, end);
        setPendingStart(null);
        setHoveredYear(null);
        setOpen(false);
    };

    // Границы диапазона для подсветки в процессе выбора (с учётом наведения)
    const previewStart = pendingStart ?? startYear;
    const previewEnd =
        pendingStart !== null ? hoveredYear ?? pendingStart : endYear;
    const lowYear = Math.min(previewStart, previewEnd);
    const highYear = Math.max(previewStart, previewEnd);

    const triggerLabel =
        startYear === endYear
            ? placeholder ?? `${startYear}`
            : `${startYear} — ${endYear}`;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn('justify-start gap-2 font-normal', className)}
                >
                    <CalendarRange className="size-4 opacity-70" />
                    {triggerLabel}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" align="start">
                <div className="flex items-center justify-between mb-3">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-7"
                        onClick={() => setGridStart((s) => s - GRID_SIZE)}
                    >
                        <ChevronLeft className="size-4" />
                    </Button>
                    <span className="text-sm font-medium">
                        {gridStart} – {gridStart + GRID_SIZE - 1}
                    </span>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-7"
                        onClick={() => setGridStart((s) => s + GRID_SIZE)}
                    >
                        <ChevronRight className="size-4" />
                    </Button>
                </div>

                <div className="grid grid-cols-4 gap-1">
                    {years.map((year) => {
                        const disabled = isDisabled(year);
                        const inRange = year >= lowYear && year <= highYear;
                        const isEdge = year === lowYear || year === highYear;

                        return (
                            <button
                                key={year}
                                type="button"
                                disabled={disabled}
                                onClick={() => handleSelect(year)}
                                onMouseEnter={() => setHoveredYear(year)}
                                onMouseLeave={() => setHoveredYear(null)}
                                className={cn(
                                    buttonVariants({
                                        variant: isEdge && inRange ? 'default' : 'ghost',
                                        size: 'sm',
                                    }),
                                    'h-9 w-full',
                                    inRange && !isEdge &&
                                        'bg-accent text-accent-foreground rounded-none',
                                    disabled && 'opacity-40 pointer-events-none',
                                )}
                            >
                                {year}
                            </button>
                        );
                    })}
                </div>

                <p className="text-xs text-muted-foreground mt-3 text-center">
                    {pendingStart === null
                        ? 'Выберите начало периода'
                        : 'Выберите конец периода'}
                </p>
            </PopoverContent>
        </Popover>
    );
}
