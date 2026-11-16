'use client';

import { Switch } from '@workspace/ui/components/switch';
import { cn } from '@workspace/ui/lib/utils';

export interface SwitchFieldProps {
    id: string;
    label: string;
    /** Пояснение под подписью */
    hint?: string;
    checked: boolean;
    onChange: (value: boolean) => void;
    disabled?: boolean;
    className?: string;
}

/** Переключатель с подписью и пояснением в рамке — вся рамка кликабельна. */
export function SwitchField({ id, label, hint, checked, onChange, disabled, className }: SwitchFieldProps) {
    return (
        <label
            htmlFor={id}
            className={cn(
                'flex cursor-pointer items-start gap-3 rounded-md border border-border/70 p-3',
                disabled && 'cursor-not-allowed opacity-60',
                className,
            )}
        >
            <Switch id={id} checked={checked} onCheckedChange={onChange} disabled={disabled} className="mt-0.5" />
            <span className="min-w-0">
                <span className="block text-sm font-medium">{label}</span>
                {hint ? <span className="block text-xs text-muted-foreground">{hint}</span> : null}
            </span>
        </label>
    );
}
