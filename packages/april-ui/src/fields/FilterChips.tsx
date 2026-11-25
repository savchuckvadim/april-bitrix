'use client';

import { cn } from '@workspace/ui/lib/utils';
import { TONE_SOLID, type Tone } from '../lib/tones';

export interface FilterChipItem {
    id: string;
    label: string;
    /** Сколько записей останется с этим фильтром; null или нет — число не показываем. */
    count?: number | null;
    /** Подсказка при наведении. */
    hint?: string;
    /** Цвет выбранного чипа (заливкой); невыбранные — нейтральной рамкой. */
    tone?: Tone;
    selected: boolean;
}

export interface FilterChipsProps {
    items: FilterChipItem[];
    onToggle: (id: string) => void;
    ariaLabel: string;
    className?: string;
}

const formatCount = (count: number): string => count.toLocaleString('ru-RU');

/**
 * Ряд чипов-переключателей для фильтров с выбором нескольких значений:
 * выбранный залит цветом тона, невыбранный — мягкая нейтральная рамка.
 * После подписи — небольшое число записей. Чипы переносятся на следующую
 * строку. Состояния не хранит: выбранность и нажатие — снаружи.
 */
export const FilterChips = ({
    items,
    onToggle,
    ariaLabel,
    className,
}: FilterChipsProps) => (
    <div
        role="group"
        aria-label={ariaLabel}
        className={cn('flex flex-wrap gap-1.5', className)}
    >
        {items.map(item => (
            <button
                key={item.id}
                type="button"
                aria-pressed={item.selected}
                title={item.hint}
                onClick={() => onToggle(item.id)}
                className={cn(
                    'inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-full border px-2.5 text-xs whitespace-nowrap transition',
                    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                    item.selected
                        ? cn(
                              TONE_SOLID[item.tone ?? 'primary'],
                              'border-transparent font-medium shadow-sm',
                          )
                        : 'border-border bg-muted/40 text-foreground hover:bg-muted',
                )}
            >
                {item.label}
                {typeof item.count === 'number' && (
                    <span className="text-[0.6875rem] tabular-nums opacity-70">
                        {formatCount(item.count)}
                    </span>
                )}
            </button>
        ))}
    </div>
);
