'use client';

import { HintTooltip } from '@workspace/april-ui';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import type { AiDealMovementMatrixBlock } from '@/modules/entities/ai-analytics';
import { AI_DEAL_MOVEMENT_TEXT } from '../../lib/deal-movement/ai-deal-movement.texts';
import type { AiDmMatrixViewRow } from '../../lib/deal-movement/ai-deal-movement-matrix.util';
import { AiDmMatrixCell } from './AiDmMatrixCell';

const T = AI_DEAL_MOVEMENT_TEXT.matrix;

interface AiDmMatrixGridProps {
    progressLevels: AiDealMovementMatrixBlock['progressLevels'];
    rows: readonly AiDmMatrixViewRow[];
}

/** Матрица: строки — полосы оценки звонка, столбцы — продвижение 1–5. */
export const AiDmMatrixGrid = ({ progressLevels, rows }: AiDmMatrixGridProps) => (
    <Table className="table-fixed">
        <TableHeader>
            <TableRow>
                <TableHead className="w-44" />
                <TableHead
                    colSpan={progressLevels.length}
                    className="text-center text-xs"
                >
                    {T.progressHead}
                </TableHead>
            </TableRow>
            <TableRow>
                <TableHead />
                {progressLevels.map(level => (
                    <TableHead key={level} className="text-center">
                        <HintTooltip
                            title={T.progressTitle(level)}
                            lines={[T.progressHints[level] ?? '']}
                        >
                            <span className="cursor-help border-b border-dashed border-muted-foreground">
                                {level}
                            </span>
                        </HintTooltip>
                    </TableHead>
                ))}
            </TableRow>
        </TableHeader>
        <TableBody>
            {rows.map(row => (
                <TableRow key={row.band.code}>
                    <TableCell className="text-xs font-medium whitespace-normal">
                        {row.band.title}
                    </TableCell>
                    {row.cells.map(cell => (
                        <AiDmMatrixCell key={cell.progress} cell={cell} />
                    ))}
                </TableRow>
            ))}
        </TableBody>
    </Table>
);
