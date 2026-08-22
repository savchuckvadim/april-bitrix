'use client';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { cn } from '@workspace/ui/lib/utils';

export interface MicroSelectOption {
    value: string;
    label: string;
}

export interface MicroSelectProps {
    value?: string;
    options: MicroSelectOption[];
    onChange: (value: string) => void;
    placeholder?: string;
    ariaLabel: string;
    invalid?: boolean;
    /** Пока идёт сохранение — выбор заблокирован. */
    disabled?: boolean;
    className?: string;
}

/**
 * Селект «пульта»: тот же кегль, что у остальных микро-контролов.
 *
 * Штатный shadcn-триггер даже в size="sm" крупнее плотной колонки плана —
 * рядом с ней отчёт выглядел бы анкетой. Ширина ограничена: длинные названия
 * причин обрезаются, полное видно в раскрытом списке.
 */
export const MicroSelect = ({
    value,
    options,
    onChange,
    placeholder,
    ariaLabel,
    invalid,
    disabled,
    className,
}: MicroSelectProps) => (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
            size="sm"
            aria-label={ariaLabel}
            aria-invalid={invalid}
            className={cn(
                'h-6 max-w-40 gap-1 px-2 py-0 text-[0.6875rem] [&>svg]:size-3',
                invalid && 'border-destructive',
                className,
            )}
        >
            <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
            {options.map(option => (
                <SelectItem
                    key={option.value}
                    value={option.value}
                    className="text-xs"
                >
                    {option.label}
                </SelectItem>
            ))}
        </SelectContent>
    </Select>
);
