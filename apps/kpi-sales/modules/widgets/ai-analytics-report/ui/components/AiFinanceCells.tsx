'use client';

import { TableCell } from '@workspace/ui/components/table';
import { HintTooltip } from '@workspace/april-ui';
import {
    formatAiCount,
    formatAiMoney,
    formatAiMoneyCompact,
    type AiFinanceTail,
} from '@/modules/entities/ai-analytics';
import { AI_SIGNAL_TABLE_TEXT } from '../../lib/ai-signal-columns.texts';

interface AiFinanceCellsProps {
    finance: AiFinanceTail;
}

/** Компактная сумма в ячейке, полная — в подсказке (сверка с «Финансами» до рубля). */
const MoneyCell = ({ value }: { value: number }) => (
    <TableCell className="text-right tabular-nums">
        <HintTooltip lines={[AI_SIGNAL_TABLE_TEXT.fullAmount(formatAiMoney(value))]}>
            <span className="cursor-help">{formatAiMoneyCompact(value)}</span>
        </HintTooltip>
    </TableCell>
);

/** Финансовые ячейки строки: сделок, аванс (в кассе), месячная сумма — как на вкладке «Финансы». */
export const AiFinanceCells = ({ finance }: AiFinanceCellsProps) => (
    <>
        <TableCell className="text-right tabular-nums">
            {formatAiCount(finance.salesCount)}
        </TableCell>
        <MoneyCell value={finance.advanceAmount} />
        <MoneyCell value={finance.monthlyAmount} />
    </>
);
