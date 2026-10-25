'use client';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { cn } from '@workspace/ui/lib/utils';

export interface ChipSelectOption {
    code: string;
    name: string;
}

export interface ChipSelectProps {
    value?: string;
    options: ChipSelectOption[];
    onChange?: (code: string) => void;
    placeholder?: string;
    ariaLabel: string;
    disabled?: boolean;
    className?: string;
}

/**
 * Компактный селект-чип для шапок: значение меняют редко, поле во всю
 * ширину для него — перебор.
 *
 * Ширина ФИКСИРОВАННАЯ, а не по содержимому: названия значений разной
 * длины, и при каждой смене чип менял размер, сдвигая всю правую часть
 * шапки. Длинное название обрезается — полное видно в раскрытом списке.
 */
export const ChipSelect = ({
    value,
    options,
    onChange,
    placeholder,
    ariaLabel,
    disabled,
    className,
}: ChipSelectProps) => (
    <Select value={value} disabled={disabled} onValueChange={onChange}>
        <SelectTrigger
            size="sm"
            aria-label={ariaLabel}
            className={cn(
                'h-7 w-36 gap-1 border-dashed px-2 text-xs [&>span]:truncate',
                className,
            )}
        >
            <SelectValue placeholder={placeholder ?? ariaLabel} />
        </SelectTrigger>
        <SelectContent>
            {options.map(option => (
                <SelectItem key={option.code} value={option.code}>
                    {option.name}
                </SelectItem>
            ))}
        </SelectContent>
    </Select>
);
