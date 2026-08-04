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

/**
 * Трёхсостоянное значение nullable-тумблера настроек:
 * null = «не задано» (действует дефолт кода конвейера), иначе явные
 * вкл/выкл. Radix Select не принимает пустую строку — поэтому сентинелы.
 */
export type TriState = 'global' | 'on' | 'off';

export const toTriState = (value: boolean | null): TriState =>
    value === null ? 'global' : value ? 'on' : 'off';

export const fromTriState = (value: TriState): boolean | null =>
    value === 'global' ? null : value === 'on';

/** Подпись показателя: описание + что действует «как глобально». */
function FieldHints({
    description,
    globalHint,
}: {
    description: string;
    globalHint: string;
}) {
    return (
        <>
            <p className="text-sm text-muted-foreground">{description}</p>
            <p className="text-xs text-muted-foreground/80">{globalHint}</p>
        </>
    );
}

/** Nullable-тумблер «Как глобально / Включено / Выключено» с пояснениями. */
export function TriStateField({
    label,
    description,
    globalHint,
    value,
    onChange,
}: {
    label: string;
    description: string;
    globalHint: string;
    value: boolean | null;
    onChange: (value: boolean | null) => void;
}) {
    return (
        <div className="space-y-1">
            <Label>{label}</Label>
            <Select
                value={toTriState(value)}
                onValueChange={(v) => onChange(fromTriState(v as TriState))}
            >
                <SelectTrigger className="w-44">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="global">По умолчанию</SelectItem>
                    <SelectItem value="on">Включено</SelectItem>
                    <SelectItem value="off">Выключено</SelectItem>
                </SelectContent>
            </Select>
            <FieldHints description={description} globalHint={globalHint} />
        </div>
    );
}

/**
 * Nullable-число: пустое поле = «как глобально» (null). Значение держится
 * строкой, Number() — при сохранении. Намеренно type="text" (+ numeric-
 * клавиатура): у type="number" браузер при опечатке вида «5e» отдаёт
 * пустой value (badInput), и явное значение молча превратилось бы в
 * «как глобально» — а так мусор доходит до валидации формы и подсвечивается.
 */
export function NumberField({
    label,
    description,
    globalHint,
    value,
    onChange,
}: {
    label: string;
    description: string;
    globalHint: string;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="space-y-1">
            <Label>{label}</Label>
            <Input
                type="text"
                inputMode="numeric"
                value={value}
                placeholder="по умолчанию"
                onChange={(e) => onChange(e.target.value)}
                className="w-44"
            />
            <FieldHints description={description} globalHint={globalHint} />
        </div>
    );
}
