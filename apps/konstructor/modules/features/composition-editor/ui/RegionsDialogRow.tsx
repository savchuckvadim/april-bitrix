'use client';

import { ToneBadge } from '@workspace/april-ui/badges';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Switch } from '@workspace/ui/components/switch';
import { cn } from '@workspace/ui/lib/utils';
import type { RegionPickerRow } from '../lib/regions-picker.util';

export interface RegionsDialogRowProps {
    row: RegionPickerRow;
    /** Это регион клиента */
    isClient: boolean;
    onToggle: () => void;
    onCounted: (counted: boolean) => void;
}

/** Регион в окне: отметка «в составе», законодательство и переключатель «считать вес». */
export const RegionsDialogRow = ({ row, isClient, onToggle, onCounted }: RegionsDialogRowProps) => (
    <div className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-muted">
        <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-2 text-sm">
            <Checkbox checked={row.selected} onCheckedChange={onToggle} className="mt-0.5" />
            <span className="min-w-0">
                <span className="block">{row.region.title}</span>
                <span className="block truncate text-[0.6875rem] text-muted-foreground">
                    {row.region.infoblock}
                </span>
            </span>
        </label>
        {isClient ? (
            <ToneBadge tone="info" variant="soft">
                Регион клиента
            </ToneBadge>
        ) : null}
        <label
            className={cn(
                'flex shrink-0 cursor-pointer items-center gap-2 text-xs text-muted-foreground',
                !row.selected && 'cursor-default opacity-50',
            )}
        >
            <Switch
                checked={row.selected ? row.counted : true}
                disabled={!row.selected}
                onCheckedChange={onCounted}
                className="scale-75"
            />
            <span>считать вес</span>
            <span className="w-7 text-right tabular-nums">{row.region.weight}</span>
        </label>
    </div>
);
