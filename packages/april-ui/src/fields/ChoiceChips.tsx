'use client';

import type { ComponentType } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { cn } from '@workspace/ui/lib/utils';
import { TONE_SOFT, TONE_SOLID, type Tone } from '../lib/tones';

export interface ChoiceChipOption {
    value: string;
    label: string;
    icon?: ComponentType<{ className?: string }>;
    /** Цвет чипа; выбранный — заливкой, остальные — мягкой подложкой. */
    tone?: Tone;
}

export type ChoiceChipsBreakpoint = 'sm' | 'md' | 'lg';

export interface ChoiceChipsProps {
    options: ChoiceChipOption[];
    value: string | null;
    onChange: (value: string) => void;
    ariaLabel: string;
    /** Ниже этой ширины чипы сворачиваются в один селект. */
    collapseBelow?: ChoiceChipsBreakpoint;
    placeholder?: string;
    className?: string;
}

/** Классы целиком литералами: Tailwind не увидит склеенную строку. */
const CHIPS_VISIBLE: Record<ChoiceChipsBreakpoint, string> = {
    sm: 'hidden sm:flex',
    md: 'hidden md:flex',
    lg: 'hidden lg:flex',
};

const SELECT_VISIBLE: Record<ChoiceChipsBreakpoint, string> = {
    sm: 'sm:hidden',
    md: 'md:hidden',
    lg: 'lg:hidden',
};

/**
 * Выбор одного значения компактными цветными чипами — когда вариантов много
 * (десяток комплектов), а места под ними должно быть мало: плитки съедали
 * пол-экрана, чипы укладываются в одну-две узкие полосы. На узком экране —
 * один селект с теми же вариантами.
 */
export const ChoiceChips = ({
    options,
    value,
    onChange,
    ariaLabel,
    collapseBelow = 'md',
    placeholder,
    className,
}: ChoiceChipsProps) => (
    <div className={cn('min-w-0', className)}>
        <div
            role="group"
            aria-label={ariaLabel}
            className={cn('flex-wrap gap-1.5', CHIPS_VISIBLE[collapseBelow])}
        >
            {options.map(option => {
                const Icon = option.icon;
                const tone = option.tone ?? 'primary';
                const isSelected = option.value === value;
                return (
                    <button
                        key={option.value}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => onChange(option.value)}
                        className={cn(
                            'inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 text-sm whitespace-nowrap transition',
                            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none [&>svg]:size-3.5',
                            isSelected
                                ? cn(TONE_SOLID[tone], 'font-medium shadow-sm')
                                : cn(TONE_SOFT[tone], 'hover:brightness-95'),
                        )}
                    >
                        {Icon ? <Icon aria-hidden /> : null}
                        {option.label}
                    </button>
                );
            })}
        </div>
        <div className={SELECT_VISIBLE[collapseBelow]}>
            <Select value={value ?? undefined} onValueChange={onChange}>
                <SelectTrigger aria-label={ariaLabel} className="w-full">
                    <SelectValue placeholder={placeholder ?? ariaLabel} />
                </SelectTrigger>
                <SelectContent>
                    {options.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    </div>
);
