'use client';

import { useMemo, useState } from 'react';
import { MicroSegmented, MicroSelect, SectionCard, ToneBadge } from '@workspace/april-ui';
import type { AiDealMovementMatrixBlock } from '@/modules/entities/ai-analytics';
import type { AiDmNameOf } from '../../hooks/use-ai-dm-name';
import { AI_DEAL_MOVEMENT_TEXT } from '../../lib/deal-movement/ai-deal-movement.texts';
import {
    aiDmCalls,
    aiDmFewCallsNote,
} from '../../lib/deal-movement/ai-deal-movement-format.util';
import {
    aiDmMatrixRows,
    aiDmMatrixSummary,
    aiDmNoScoreText,
    aiDmPickMatrix,
    isAiDmMatrixMode,
    type AiDmMatrixMode,
} from '../../lib/deal-movement/ai-deal-movement-matrix.util';
import { AiDmMatrixGrid } from './AiDmMatrixGrid';
import { AiDmSkeleton } from './AiDmSkeleton';

const T = AI_DEAL_MOVEMENT_TEXT.matrix;

const MODE_OPTIONS = [
    { value: 'department', label: T.mode.department },
    { value: 'manager', label: T.mode.manager },
];

interface AiDmMatrixSectionProps {
    /** null — обзор ещё грузится. */
    block: AiDealMovementMatrixBlock | null;
    nameOf: AiDmNameOf;
}

/**
 * «Качество звонков и продвижение сделки»: тепловая матрица по отделу или
 * менеджеру. «Мало звонков» — пометкой, числа видны всегда.
 */
export const AiDmMatrixSection = ({ block, nameOf }: AiDmMatrixSectionProps) => {
    const [mode, setMode] = useState<AiDmMatrixMode>('department');
    const [managerId, setManagerId] = useState<string | null>(null);
    const picked = useMemo(
        () => (block ? aiDmPickMatrix(block, mode, managerId) : null),
        [block, mode, managerId],
    );
    const rows = useMemo(
        () => (block && picked?.matrix ? aiDmMatrixRows(block, picked.matrix) : []),
        [block, picked],
    );
    const managerOptions = useMemo(
        () =>
            (block?.managers ?? []).map(item => ({
                value: item.managerId,
                label: `${nameOf(item.managerId, item.managerName)} · ${aiDmCalls(item.n)}`,
            })),
        [block, nameOf],
    );
    const matrix = picked?.matrix ?? null;
    const fewNote = matrix ? aiDmFewCallsNote(matrix, T.fewCalls) : null;
    const noScoreText = block ? aiDmNoScoreText(block.noScore) : null;

    return (
        <SectionCard
            surface="glass"
            title={T.title}
            description={T.description}
            wrapActions
            actions={
                <div className="flex flex-wrap items-center gap-2">
                    <MicroSegmented
                        ariaLabel={T.modeAria}
                        options={MODE_OPTIONS}
                        value={mode}
                        onChange={value => isAiDmMatrixMode(value) && setMode(value)}
                        size="xs"
                    />
                    {mode === 'manager' && managerOptions.length > 0 && (
                        <MicroSelect
                            ariaLabel={T.managerLabel}
                            value={picked?.managerId ?? undefined}
                            options={managerOptions}
                            onChange={setManagerId}
                        />
                    )}
                </div>
            }
        >
            {!block ? (
                <AiDmSkeleton rows={3} />
            ) : !matrix ? (
                <p className="py-2 text-xs text-muted-foreground">{T.noManagers}</p>
            ) : matrix.n === 0 ? (
                <p className="py-2 text-xs text-muted-foreground">{T.empty}</p>
            ) : (
                <div className="space-y-2">
                    <AiDmMatrixGrid progressLevels={block.progressLevels} rows={rows} />
                    <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>{aiDmMatrixSummary(matrix)}</span>
                        {fewNote && (
                            <ToneBadge tone="warning" variant="soft" size="sm">
                                {fewNote}
                            </ToneBadge>
                        )}
                    </p>
                    {mode === 'department' && noScoreText && (
                        <p className="text-xs text-muted-foreground">{noScoreText}</p>
                    )}
                </div>
            )}
        </SectionCard>
    );
};
