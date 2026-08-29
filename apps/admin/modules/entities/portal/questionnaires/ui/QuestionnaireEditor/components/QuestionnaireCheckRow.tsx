'use client';

import { Badge } from '@workspace/ui/components/badge';
import { TableCell, TableRow } from '@workspace/ui/components/table';
import { cn } from '@workspace/ui/lib/utils';
import { QUESTIONNAIRE_EDITOR_TEXT } from '../../../consts/questionnaires.const';
import type { QuestionnaireCheckRow as CheckRow } from '../../../lib/check-result-view';

interface QuestionnaireCheckRowProps {
    row: CheckRow;
}

/**
 * Результат сверки одного вопроса.
 *
 * Текст «что случилось» приходит от бэка (поля больше нет, поле сменило
 * тип, читали без прав администратора) — админка его не переписывает: это
 * ровно то, что бэк увидел в Битриксе.
 */
export const QuestionnaireCheckRow = ({ row }: QuestionnaireCheckRowProps) => (
    <TableRow className={cn(row.isProblem && 'bg-destructive/5')}>
        <TableCell className="align-top">
            <div className="space-y-0.5">
                <span className="text-sm">{row.itemTitle}</span>
                <code className="block text-xs text-muted-foreground">
                    {row.itemCode}
                </code>
            </div>
        </TableCell>

        <TableCell className="align-top">
            {row.fieldName ? (
                <code className="text-xs">{row.fieldName}</code>
            ) : (
                <span className="text-xs text-muted-foreground">
                    {QUESTIONNAIRE_EDITOR_TEXT.pickerNoValue}
                </span>
            )}
        </TableCell>

        <TableCell className="align-top">
            <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-1">
                    <Badge
                        variant={row.isProblem ? 'destructive' : 'secondary'}
                    >
                        {row.statusLabel}
                    </Badge>
                    {row.changed && (
                        <Badge variant="outline">
                            {QUESTIONNAIRE_EDITOR_TEXT.checkChangedMark}
                        </Badge>
                    )}
                    {row.deactivatedOptions > 0 && (
                        <Badge variant="outline">
                            {QUESTIONNAIRE_EDITOR_TEXT.checkOptionsOff}:{' '}
                            {row.deactivatedOptions}
                        </Badge>
                    )}
                    {/* Расхождение — не поломка: подтягивает его владелец
                        в панели «В Битриксе изменилось». */}
                    {row.changeCount > 0 && (
                        <Badge variant="outline">
                            {QUESTIONNAIRE_EDITOR_TEXT.checkChangesMark}:{' '}
                            {row.changeCount}
                        </Badge>
                    )}
                </div>
                {row.comment && (
                    <p className="text-xs text-muted-foreground">
                        {row.comment}
                    </p>
                )}
            </div>
        </TableCell>
    </TableRow>
);
