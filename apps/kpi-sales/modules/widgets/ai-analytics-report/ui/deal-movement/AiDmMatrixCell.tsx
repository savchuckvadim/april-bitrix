'use client';

import { TONE_SOFT } from '@workspace/april-ui';
import { TableCell } from '@workspace/ui/components/table';
import { cn } from '@workspace/ui/lib/utils';
import { formatAiCount } from '@/modules/entities/ai-analytics';
import type { AiDmMatrixViewCell } from '../../lib/deal-movement/ai-deal-movement-matrix.util';

interface AiDmMatrixCellProps {
    cell: AiDmMatrixViewCell;
}

/**
 * Клетка тепловой матрицы: число звонков, насыщенность — от самой полной
 * клетки. Клетка «клиент купил бы и без менеджера» — в рамке и с подписью.
 */
export const AiDmMatrixCell = ({ cell }: AiDmMatrixCellProps) => (
    <TableCell
        title={cell.hint}
        className={cn(
            'text-center align-middle tabular-nums',
            cell.heatClass,
            cell.flagged && 'ring-2 ring-inset ring-warning',
        )}
    >
        <span className={cn('text-base font-semibold', cell.count === 0 && 'text-muted-foreground')}>
            {formatAiCount(cell.count)}
        </span>
        {cell.flagged && cell.flagTitle && (
            <span
                className={cn(
                    'mt-1 block rounded px-1 text-[0.6875rem] leading-tight whitespace-normal',
                    TONE_SOFT.warning,
                )}
            >
                {cell.flagTitle}
            </span>
        )}
    </TableCell>
);
