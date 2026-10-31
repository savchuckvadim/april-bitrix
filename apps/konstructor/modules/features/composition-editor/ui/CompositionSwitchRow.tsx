'use client';

import type { ReactNode } from 'react';
import { Switch } from '@workspace/ui/components/switch';
import { cn } from '@workspace/ui/lib/utils';

export interface CompositionSwitchRowProps {
    name: string;
    checked: boolean;
    onToggle: (next: boolean) => void;
    mark?: ReactNode;
}

/** Строка плотного вида: тумблер, название в одну строку, вес. */
export const CompositionSwitchRow = ({
    name,
    checked,
    onToggle,
    mark,
}: CompositionSwitchRowProps) => (
    <label
        title={name}
        className={cn(
            'flex h-8 min-w-0 cursor-pointer items-center gap-2 rounded-md px-2 text-[0.8125rem] hover:bg-muted',
            !checked && 'text-muted-foreground',
        )}
    >
        <Switch checked={checked} onCheckedChange={onToggle} className="scale-75" />
        <span className="min-w-0 truncate">{name}</span>
        {mark}
    </label>
);
