'use client';

import { Button } from '@workspace/ui/components/button';
import { AI_MATRIX_BLOCK_TEXT } from '../../lib/ai-matrix-texts';

interface AiMatrixHiddenNoteProps {
    /** Сколько сотрудников без разборов скрыто (0 — строки не рисуем, если не раскрыто). */
    hiddenCount: number;
    showHidden: boolean;
    onToggle: () => void;
}

/**
 * Подпись под таблицей: «Без разборов за период: N сотрудников — показать»
 * с раскрытием; в раскрытом виде — «скрыть».
 */
export const AiMatrixHiddenNote = ({
    hiddenCount,
    showHidden,
    onToggle,
}: AiMatrixHiddenNoteProps) => {
    if (!hiddenCount && !showHidden) return null;
    const T = AI_MATRIX_BLOCK_TEXT.hidden;
    return (
        <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            {hiddenCount > 0 && <span>{T.label(hiddenCount)} —</span>}
            <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs"
                onClick={onToggle}
            >
                {showHidden ? T.hide : T.show}
            </Button>
        </div>
    );
};
