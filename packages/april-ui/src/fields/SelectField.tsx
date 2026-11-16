'use client';

import { Label } from '@workspace/ui/components/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { cn } from '@workspace/ui/lib/utils';

export interface SelectFieldOption<T extends string> {
    value: T;
    label: string;
}

export interface SelectFieldProps<T extends string> {
    id: string;
    label: string;
    options: readonly SelectFieldOption<T>[];
    value: T;
    onChange: (value: T) => void;
    disabled?: boolean;
    className?: string;
}

/** Селект с подписью над ним; значение типизировано вариантами. */
export function SelectField<T extends string>({
    id,
    label,
    options,
    value,
    onChange,
    disabled,
    className,
}: SelectFieldProps<T>) {
    return (
        <div className={cn('flex flex-col gap-1.5', className)}>
            <Label htmlFor={id}>{label}</Label>
            <Select
                value={value}
                onValueChange={next => onChange(options.find(option => option.value === next)?.value ?? value)}
                disabled={disabled}
            >
                <SelectTrigger id={id}>
                    <SelectValue />
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
    );
}
