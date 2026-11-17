'use client';

import { dealMovementNotesLines } from '../../../lib/deal-movement-notes-text';
import type {
    DealMovementNotesSummary,
    DealMovementRunMode,
} from '../../../model';

interface DealMovementNotesViewProps {
    notes: DealMovementNotesSummary | undefined;
    mode: DealMovementRunMode;
}

/**
 * Записи в ленту сделок за прогон: сколько записано, отложено, подсказок и
 * не удалось (у подсчёта — сколько записали бы). У старых прогонов итога
 * записей нет — ничего не показываем.
 */
export const DealMovementNotesView = ({
    notes,
    mode,
}: DealMovementNotesViewProps) => {
    if (!notes) return null;
    return (
        <>
            {dealMovementNotesLines(notes, mode).map(line => (
                <p key={line} className="text-sm text-muted-foreground">
                    {line}
                </p>
            ))}
        </>
    );
};
