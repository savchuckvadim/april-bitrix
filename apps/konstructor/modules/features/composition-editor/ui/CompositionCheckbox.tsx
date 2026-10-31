'use client';

import type { ReactNode } from 'react';
import { Checkbox } from '@workspace/ui/components/checkbox';

export interface CompositionCheckboxProps {
    name: string;
    checked: boolean;
    onToggle: (next: boolean) => void;
    disabled?: boolean;
    /** Метка веса справа */
    mark?: ReactNode;
    /** Кнопки у пункта: вне подписи, чтобы их нажатие не переключало чекбокс */
    trailing?: ReactNode;
}

/** Пункт наполнения: чекбокс с названием, кликабельна вся строка. */
export const CompositionCheckbox = ({
    name,
    checked,
    onToggle,
    disabled,
    mark,
    trailing,
}: CompositionCheckboxProps) => (
    <div className="flex min-w-0 items-center rounded-md hover:bg-muted">
        <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-2 px-2 py-1.5 text-sm">
            <Checkbox
                checked={checked}
                disabled={disabled}
                onCheckedChange={next => onToggle(next === true)}
                className="mt-0.5"
            />
            <span className="min-w-0">{name}</span>
            {mark}
        </label>
        {trailing}
    </div>
);
