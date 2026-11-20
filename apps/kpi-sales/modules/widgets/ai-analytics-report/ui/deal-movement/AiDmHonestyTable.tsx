'use client';

import { ToneBadge } from '@workspace/april-ui';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import {
    formatAiCount,
    type AiDealMovementHonestyBlock,
} from '@/modules/entities/ai-analytics';
import type { AiDmNameOf } from '../../hooks/use-ai-dm-name';
import { AI_DEAL_MOVEMENT_TEXT } from '../../lib/deal-movement/ai-deal-movement.texts';
import { aiDmFewCallsNote } from '../../lib/deal-movement/ai-deal-movement-format.util';
import {
    aiDmHonestyHighColumn,
    aiDmHonestyShare,
} from '../../lib/deal-movement/ai-deal-movement-honesty.util';

const T = AI_DEAL_MOVEMENT_TEXT.honesty;

interface AiDmHonestyTableProps {
    block: AiDealMovementHonestyBlock;
    nameOf: AiDmNameOf;
}

/** Честность оценок по менеджерам: доля «стадия не сдвинулась», ожидание и непроверенные. */
export const AiDmHonestyTable = ({ block, nameOf }: AiDmHonestyTableProps) => (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead>{T.columns.manager}</TableHead>
                <TableHead className="text-right">
                    {aiDmHonestyHighColumn(block.progressMin)}
                </TableHead>
                <TableHead className="text-right">{T.columns.still}</TableHead>
                <TableHead className="text-right" title={T.pendingHint}>
                    {T.columns.pending}
                </TableHead>
                <TableHead className="text-right" title={T.uncheckedHint}>
                    {T.columns.unchecked}
                </TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {block.managers.map(row => {
                const fewNote = aiDmFewCallsNote(row, T.fewCalls);
                return (
                    <TableRow key={row.managerId}>
                        <TableCell>
                            <span className="font-medium">
                                {nameOf(row.managerId, row.managerName)}
                            </span>
                            {fewNote && (
                                <ToneBadge tone="warning" variant="soft" size="sm" className="ml-2">
                                    {fewNote}
                                </ToneBadge>
                            )}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                            {formatAiCount(row.highProgress)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums whitespace-nowrap">
                            {aiDmHonestyShare(row)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                            {formatAiCount(row.pending)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                            {formatAiCount(row.unchecked)}
                        </TableCell>
                    </TableRow>
                );
            })}
        </TableBody>
    </Table>
);
