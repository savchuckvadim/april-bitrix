'use client';

import type { ReactNode } from 'react';
import { Switch } from '@workspace/ui/components/switch';
import { cn } from '@workspace/ui/lib/utils';

export interface CompositionSwitchRowProps {
    name: string;
    checked: boolean;
    onToggle: (next: boolean) => void;
    disabled?: boolean;
    mark?: ReactNode;
    /** Кнопки у пункта: вне подписи, чтобы их нажатие не переключало тумблер */
    trailing?: ReactNode;
}

/** Строка плотного вида: тумблер, название в одну строку, вес. */
export const CompositionSwitchRow = ({
    name,
    checked,
    onToggle,
    disabled,
    mark,
    trailing,
}: CompositionSwitchRowProps) => (
    <div className={cn('flex min-w-0 items-center rounded-md hover:bg-muted', !checked && 'text-muted-foreground')}>
        <label
            title={name}
            className="flex h-8 min-w-0 flex-1 cursor-pointer items-center gap-2 px-2 text-[0.8125rem]"
        >
            <Switch checked={checked} disabled={disabled} onCheckedChange={onToggle} className="scale-75" />
            <span className="min-w-0 truncate">{name}</span>
            {mark}
        </label>
        {trailing}
    </div>
);
