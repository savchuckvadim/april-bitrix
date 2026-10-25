'use client';

import { Checkbox } from '@workspace/ui/components/checkbox';

export interface CompositionCheckboxProps {
    name: string;
    checked: boolean;
    onToggle: (next: boolean) => void;
}

/** Пункт наполнения: чекбокс с названием, кликабельна вся строка. */
export const CompositionCheckbox = ({
    name,
    checked,
    onToggle,
}: CompositionCheckboxProps) => (
    <label className="flex min-w-0 cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted">
        <Checkbox
            checked={checked}
            onCheckedChange={next => onToggle(next === true)}
            className="mt-0.5"
        />
        <span className="min-w-0">{name}</span>
    </label>
);
