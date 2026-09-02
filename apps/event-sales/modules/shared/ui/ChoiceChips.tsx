'use client';

import { FC } from 'react';
import { cn } from '@workspace/ui/lib/utils';

export interface ChoiceChipOption {
    code: string;
    name: string;
}

interface ChoiceChipsProps {
    options: ChoiceChipOption[];
    selected: string[];
    onToggle: (code: string) => void;
    /** Подсветка обязательного, но пустого выбора. */
    invalid?: boolean;
    ariaLabel?: string;
}

/**
 * Множественный выбор чипами-переключателями.
 *
 * Без выпадающего списка: вариантов немного, а видеть сразу и выбранные,
 * и невыбранные важнее компактности — по одному взгляду понятно, что
 * отмечено. Нажатое состояние — `aria-pressed`; что делать с выбором
 * (писать в CRM сразу или копить в форме), решает вызывающий.
 */
export const ChoiceChips: FC<ChoiceChipsProps> = ({
    options,
    selected,
    onToggle,
    invalid,
    ariaLabel,
}) => (
    <div
        role="group"
        aria-label={ariaLabel}
        aria-invalid={invalid}
        className="flex flex-wrap items-center gap-1"
    >
        {options.map(option => {
            const isSelected = selected.includes(option.code);
            return (
                <button
                    key={option.code}
                    type="button"
                    aria-pressed={isSelected}
                    title={option.name}
                    onClick={() => onToggle(option.code)}
                    className={cn(
                        'max-w-full truncate rounded-md border px-2 py-0.5 text-xs transition-colors',
                        'focus-visible:ring-ring/50 outline-none focus-visible:ring-[3px]',
                        isSelected
                            ? 'border-primary/40 bg-primary/10 text-foreground'
                            : 'border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                        invalid && !isSelected && 'border-destructive/50',
                    )}
                >
                    {option.name}
                </button>
            );
        })}
    </div>
);
