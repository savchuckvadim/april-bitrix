'use client';

import { ArrowDown, ArrowUp } from 'lucide-react';
import { TableHead } from '@workspace/ui/components/table';
import { HintTooltip } from '@workspace/april-ui';
import { cn } from '@workspace/ui/lib/utils';
import type { DigestSort, DigestSortKey } from '../lib/digest-table.util';

interface DigestTableHeadProps {
    sortKey: DigestSortKey;
    label: string;
    hint?: string;
    sort: DigestSort;
    onSort: (key: DigestSortKey) => void;
    align?: 'left' | 'right';
}

/** Заголовок колонки: подпись с подсказкой и сортировка по клику. */
export const DigestTableHead = ({
    sortKey,
    label,
    hint,
    sort,
    onSort,
    align = 'right',
}: DigestTableHeadProps) => {
    const active = sort.key === sortKey;
    const Icon = sort.dir === 'asc' ? ArrowUp : ArrowDown;
    const button = (
        <button
            type="button"
            className={cn(
                'inline-flex items-center gap-1 whitespace-nowrap text-xs font-semibold hover:text-primary',
                active && 'text-primary',
            )}
            onClick={() => onSort(sortKey)}
        >
            {label}
            {active && <Icon className="h-3 w-3" />}
        </button>
    );
    return (
        <TableHead className={cn(align === 'right' ? 'text-right' : 'text-left')}>
            {hint ? <HintTooltip title={label} lines={[hint]}>{button}</HintTooltip> : button}
        </TableHead>
    );
};
