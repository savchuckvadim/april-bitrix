'use client';

import { HintTooltip } from '@workspace/april-ui';
import { TableCell, TableRow } from '@workspace/ui/components/table';
import { cn } from '@workspace/ui/lib/utils';
import {
    formatAiCount,
    formatAiMoney,
    formatAiMoneyCompact,
    type AiDealMovementManagerStatuses,
    type AiDealMovementStatus,
} from '@/modules/entities/ai-analytics';
import { AI_DEAL_MOVEMENT_TEXT } from '../../lib/deal-movement/ai-deal-movement.texts';
import { aiDmOrderedCells } from '../../lib/deal-movement/ai-deal-movement-status.util';
import { AiDmCountCell } from './AiDmCountCell';

interface AiDmManagerRowProps {
    manager: AiDealMovementManagerStatuses;
    name: string;
    titles: ReadonlyMap<AiDealMovementStatus, string>;
    selected: boolean;
    onPick: (managerId: string) => void;
}

/** Строка менеджера: имя — кнопка фильтра проблемных сделок ниже. */
export const AiDmManagerRow = ({
    manager,
    name,
    titles,
    selected,
    onPick,
}: AiDmManagerRowProps) => (
    <TableRow data-state={selected ? 'selected' : undefined}>
        <TableCell>
            <button
                type="button"
                title={AI_DEAL_MOVEMENT_TEXT.managers.pick}
                aria-pressed={selected}
                onClick={() => onPick(manager.managerId)}
                className={cn(
                    'text-left font-medium text-primary underline-offset-2 hover:underline',
                    selected && 'underline',
                )}
            >
                {name}
            </button>
        </TableCell>
        {aiDmOrderedCells(manager.cells, titles).map(cell => (
            <AiDmCountCell key={cell.status} cell={cell} />
        ))}
        <TableCell className="text-right font-medium tabular-nums">
            {formatAiCount(manager.problemCount)}
        </TableCell>
        <TableCell className="text-right tabular-nums">
            <HintTooltip title={formatAiMoney(manager.problemAmountSum)}>
                <span>{formatAiMoneyCompact(manager.problemAmountSum)}</span>
            </HintTooltip>
        </TableCell>
    </TableRow>
);
