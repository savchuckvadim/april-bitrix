'use client';

import { cn } from '@workspace/ui/lib/utils';
import type { BadgeRegistryOption } from '../../../model';

interface BadgeBindingChipsProps {
    options: readonly BadgeRegistryOption[];
    selected: readonly string[];
    onToggle: (code: string) => void;
    /** Подпись пустого выбора: «всегда» / «все типы». */
    emptyLabel: string;
    disabled?: boolean;
}

/**
 * Привязки бейджика чипами-переключателями: все варианты видны сразу,
 * пустой выбор означает «везде» — и это написано словами, а не угадывается
 * по отсутствию отметок.
 */
export const BadgeBindingChips = ({
    options,
    selected,
    onToggle,
    emptyLabel,
    disabled,
}: BadgeBindingChipsProps) => (
    <div className="flex flex-wrap items-center gap-1">
        {options.map(option => {
            const isSelected = selected.includes(option.code);
            return (
                <button
                    key={option.code}
                    type="button"
                    aria-pressed={isSelected}
                    title={option.description}
                    disabled={disabled}
                    onClick={() => onToggle(option.code)}
                    className={cn(
                        'rounded-md border px-1.5 py-0.5 text-[0.6875rem] transition-colors disabled:opacity-60',
                        isSelected
                            ? 'border-primary/40 bg-primary/10 text-foreground'
                            : 'border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                    )}
                >
                    {option.name}
                </button>
            );
        })}
        {selected.length === 0 && (
            <span className="text-[0.6875rem] text-muted-foreground">— {emptyLabel}</span>
        )}
    </div>
);
