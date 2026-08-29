'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import {
    QUESTIONNAIRE_MATRIX_TEXT,
    QUESTIONNAIRE_NEW_ID,
} from '../../../consts/questionnaires.const';
import type { QuestionnaireMatrixCell as MatrixCell } from '../../../lib/questionnaire-matrix';
import { questionnairePresetSearch } from '../../../lib/questionnaire-preset';
import { QuestionnaireMatrixItem } from './QuestionnaireMatrixItem';

interface QuestionnaireMatrixCellProps {
    portalId: number;
    cell: MatrixCell;
}

/**
 * Ячейка матрицы: что спросят на этом типе события в этом назначении.
 *
 * Пустая ячейка — не пустое место, а предложение: кнопка ведёт в редактор с
 * УЖЕ проставленными назначением и условием (координаты клетки уезжают в
 * адрес). Иначе владелец, кликнув по клетке «Решение», собирал бы её
 * условие руками заново — и легко промахивался мимо той самой клетки.
 */
export const QuestionnaireMatrixCell = ({
    portalId,
    cell,
}: QuestionnaireMatrixCellProps) => {
    if (cell.cards.length === 0) {
        const search = questionnairePresetSearch(cell.preset);
        return (
            <Link
                href={`/portal/${portalId}/questionnaires/${QUESTIONNAIRE_NEW_ID}?${search}`}
                title={QUESTIONNAIRE_MATRIX_TEXT.cellCreateHint}
                className="text-muted-foreground hover:border-foreground/30 hover:text-foreground inline-flex items-center gap-1 rounded-md border border-dashed px-2 py-1.5 text-xs transition-colors"
            >
                <Plus className="h-3.5 w-3.5" />
                {QUESTIONNAIRE_MATRIX_TEXT.cellCreate}
            </Link>
        );
    }

    return (
        <div className="flex flex-col gap-1.5">
            {cell.cards.map(card => (
                <QuestionnaireMatrixItem
                    key={card.id}
                    portalId={portalId}
                    card={card}
                />
            ))}
        </div>
    );
};
