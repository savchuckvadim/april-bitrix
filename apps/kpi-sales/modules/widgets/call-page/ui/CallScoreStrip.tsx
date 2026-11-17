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
 * Сводка оценок разделов под шапкой одной сеткой (от 1 до 10). Нажатие на
 * раздел прокручивает к нему ниже. Оценка звонка — крупно в шапке, здесь
 * не повторяется (решение владельца 17.11.2026).
 */
export const CallScoreStrip = ({ score, sections }: CallScoreStripProps) => {
    const cells = scoreCells(score, sections).filter(
        cell => cell.anchorId !== null,
    );
    if (cells.length === 0) return null;
    return (
        <nav
            aria-label="Оценки разделов"
            className="rounded-lg border border-border bg-card p-2"
        >
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-1">
                {cells.map(cell => (
                    <li key={cell.key}>
                        <button
                            type="button"
                            className={cn(CELL, 'cursor-pointer hover:bg-muted')}
                            onClick={() => {
                                if (cell.anchorId) scrollToAnchor(cell.anchorId);
                            }}
                        >
                            <CellContent cell={cell} />
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
};
