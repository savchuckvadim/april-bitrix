'use client';

import { HintTooltip } from '@workspace/april-ui';
import { TableCell } from '@workspace/ui/components/table';
import {
    formatAiCount,
    type AiDealMovementStatusCell,
} from '@/modules/entities/ai-analytics';
import { aiDmCountWithSum } from '../../lib/deal-movement/ai-deal-movement-format.util';

interface AiDmCountCellProps {
    cell: AiDealMovementStatusCell;
}

/** Ячейка таблицы менеджеров: число сделок, сумма — во всплывающей подсказке. */
export const AiDmCountCell = ({ cell }: AiDmCountCellProps) => (
    <TableCell className="text-right tabular-nums">
        {cell.count > 0 ? (
            <HintTooltip title={cell.title} lines={[aiDmCountWithSum(cell.count, cell.amountSum)]}>
                <span className="cursor-help border-b border-dashed border-muted-foreground">
                    {formatAiCount(cell.count)}
                </span>
            </HintTooltip>
        ) : (
            <span className="text-muted-foreground">0</span>
        )}
    </TableCell>
);
