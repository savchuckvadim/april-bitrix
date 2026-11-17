'use client';

import { ToneBadge } from '@workspace/april-ui/badges';
import { cn } from '@workspace/ui/lib/utils';
import {
    formatScore,
    scoreCells,
    scoreTone,
    type CallPageScoreCell,
    type CallPageSectionDto,
} from '@/modules/entities/call-page';

interface CallScoreStripProps {
    score: number | null;
    sections: CallPageSectionDto[];
}

const CELL =
    'flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm';

const scrollToAnchor = (anchorId: string) =>
    document
        .getElementById(anchorId)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });

const CellContent = ({ cell }: { cell: CallPageScoreCell }) => (
    <>
        <span className="min-w-0 truncate" title={cell.title}>
            {cell.title}
        </span>
        <ToneBadge size="sm" variant="soft" tone={scoreTone(cell.score)}>
            {formatScore(cell.score)}
        </ToneBadge>
    </>
);

/**
 * Сводка оценок под шапкой: оценка звонка и оценки разделов одной сеткой
 * (от 1 до 10). Нажатие на раздел прокручивает к нему ниже.
 */
export const CallScoreStrip = ({ score, sections }: CallScoreStripProps) => (
    <nav
        aria-label="Оценки звонка и разделов"
        className="rounded-lg border border-border bg-card p-2"
    >
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-1">
            {scoreCells(score, sections).map(cell => (
                <li key={cell.key}>
                    {cell.anchorId === null ? (
                        <div className={cn(CELL, 'bg-muted font-medium')}>
                            <CellContent cell={cell} />
                        </div>
                    ) : (
                        <button
                            type="button"
                            className={cn(CELL, 'cursor-pointer hover:bg-muted')}
                            onClick={() => {
                                if (cell.anchorId) scrollToAnchor(cell.anchorId);
                            }}
                        >
                            <CellContent cell={cell} />
                        </button>
                    )}
                </li>
            ))}
        </ul>
    </nav>
);
