'use client';

import Link from 'next/link';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Loader2, Pencil, RefreshCw, Trash2 } from 'lucide-react';
import { QUESTIONNAIRES_TEXT } from '../../../consts/questionnaires.const';
import type { QuestionnaireCheckSummary } from '../../../lib/check-result-view';
import type { QuestionnaireRow } from '../../../lib/questionnaire-list-view';

interface QuestionnaireRowActionsProps {
    row: QuestionnaireRow;
    portalId: number;
    /** Эта анкета сейчас сверяет привязки. */
    isChecking: boolean;
    /** Итог сверки этой строки; пусто — её в этот раз не сверяли. */
    checkSummary?: QuestionnaireCheckSummary;
    onCheck: (row: QuestionnaireRow) => void;
    onRemove: (row: QuestionnaireRow) => void;
}

/**
 * Действия строки: открыть в редакторе, сверить привязки к полям Битрикса
 * и удалить анкету.
 *
 * Открытие — ссылка, а не клик по строке: в строке живут переключатель и
 * кнопки, и клик по ним не должен уводить со списка.
 *
 * Итог сверки показывается рядом с кнопкой двумя разными вещами: проблемы
 * (вопрос во фрейм не уедет — чинить) и расхождения с Битриксом
 * (переименования и варианты — подтягивать в редакторе). Одним числом их
 * не сложить: чинить и соглашаться — разные действия.
 */
export const QuestionnaireRowActions = ({
    row,
    portalId,
    isChecking,
    checkSummary,
    onCheck,
    onRemove,
}: QuestionnaireRowActionsProps) => (
    <div className="flex items-center justify-end gap-1">
        <Button asChild variant="outline" size="sm">
            <Link href={`/portal/${portalId}/questionnaires/${row.id}`}>
                <Pencil className="h-4 w-4" />
                {QUESTIONNAIRES_TEXT.open}
            </Link>
        </Button>
        <Button
            variant="outline"
            size="sm"
            disabled={isChecking}
            onClick={() => onCheck(row)}
        >
            {isChecking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <RefreshCw className="h-4 w-4" />
            )}
            {isChecking
                ? QUESTIONNAIRES_TEXT.checking
                : QUESTIONNAIRES_TEXT.check}
        </Button>

        {checkSummary && !isChecking && (
            <div className="flex items-center gap-1">
                {checkSummary.problemCount > 0 && (
                    <Badge
                        variant="destructive"
                        title={QUESTIONNAIRES_TEXT.issuesHint}
                    >
                        {QUESTIONNAIRES_TEXT.checkResultProblems}:{' '}
                        {checkSummary.problemCount}
                    </Badge>
                )}
                {checkSummary.changeCount > 0 && (
                    <Badge
                        variant="outline"
                        title={QUESTIONNAIRES_TEXT.checkResultChangesHint}
                    >
                        {QUESTIONNAIRES_TEXT.checkResultChanges}:{' '}
                        {checkSummary.changeCount}
                    </Badge>
                )}
                {checkSummary.problemCount === 0 &&
                    checkSummary.changeCount === 0 && (
                        <span
                            className="text-xs text-muted-foreground"
                            title={checkSummary.headline}
                        >
                            {QUESTIONNAIRES_TEXT.checkResultClean}
                        </span>
                    )}
            </div>
        )}
        <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            aria-label={QUESTIONNAIRES_TEXT.remove}
            onClick={() => onRemove(row)}
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    </div>
);
