'use client';

import * as React from 'react';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { cn } from '@workspace/ui/lib/utils';

/** Сентинел пункта «ввести новое значение» в селекте. */
export const NEW_OPTION = '__new__';

export interface SelectWithNewOption {
    value: string;
    label: string;
}

interface SelectWithNewProps {
    label: string;
    options: SelectWithNewOption[];
    /** Подпись пункта «ввести новое значение». */
    newOptionLabel: string;
    value: string;
    onValueChange: (value: string) => void;
    /** Черновик нового значения (виден при выбранном NEW_OPTION). */
    newValue: string;
    onNewValueChange: (value: string) => void;
    newPlaceholder: string;
    /** Признак невалидности введённого нового значения. */
    isNewInvalid?: boolean;
    /** Подсказка о формате — показывается при невалидном значении. */
    invalidHint?: string;
    className?: string;
}

/**
 * Селект со списком существующих значений и пунктом «ввести новое»:
 * при его выборе под селектом появляется поле ввода. Используется для
 * выбора базы (домена) и типа (kind) базы знаний.
 */
export function SelectWithNew({
    label,
    options,
    newOptionLabel,
    value,
    onValueChange,
    newValue,
    onNewValueChange,
    newPlaceholder,
    isNewInvalid = false,
    invalidHint,
    className,
}: SelectWithNewProps) {
    return (
        <div className={cn('space-y-1', className)}>
            <Label className="text-xs text-muted-foreground">{label}</Label>
            <Select value={value} onValueChange={onValueChange}>
                <SelectTrigger className="w-64">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                    <SelectItem value={NEW_OPTION}>{newOptionLabel}</SelectItem>
                </SelectContent>
            </Select>
            {value === NEW_OPTION && (
                <>
                    <Input
                        value={newValue}
                        onChange={(event) =>
                            onNewValueChange(event.target.value)
                        }
                        placeholder={newPlaceholder}
                        className="w-64"
                    />
                    {isNewInvalid && invalidHint && (
                        <p className="text-xs text-red-600">{invalidHint}</p>
                    )}
                </>
            )}
        </div>
    );
}
