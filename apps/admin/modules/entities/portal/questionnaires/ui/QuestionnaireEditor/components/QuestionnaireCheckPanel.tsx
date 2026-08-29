'use client';

import { Button } from '@workspace/ui/components/button';
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { cn } from '@workspace/ui/lib/utils';
import { QUESTIONNAIRE_EDITOR_TEXT } from '../../../consts/questionnaires.const';
import type { QuestionnaireCheckSummary } from '../../../lib/check-result-view';
import { QuestionnaireCheckRow } from './QuestionnaireCheckRow';

interface QuestionnaireCheckPanelProps {
    summary: QuestionnaireCheckSummary;
    onHide: () => void;
}

/**
 * Итог сверки привязок с живым Битриксом.
 *
 * Проверка меняет то, что увидит менеджер: вопрос с пропавшим полем в
 * каталог фрейма не попадёт, а исчезнувшие варианты справочника гаснут.
 * Поэтому результат показывается разбором по вопросам, а не одним
 * всплывающим сообщением — чинить владелец будет здесь же, в редакторе.
 */
export const QuestionnaireCheckPanel = ({
    summary,
    onHide,
}: QuestionnaireCheckPanelProps) => (
    <section
        className={cn(
            'space-y-3 rounded-lg border p-4',
            summary.hasProblems && 'border-destructive/50',
        )}
    >
        <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-3xl space-y-1">
                <h2 className="text-sm font-semibold">
                    {QUESTIONNAIRE_EDITOR_TEXT.checkTitle}
                </h2>
                <p
                    className={cn(
                        'text-sm',
                        summary.hasProblems
                            ? 'text-destructive'
                            : 'text-muted-foreground',
                    )}
                >
                    {summary.headline}
                </p>
                {summary.description && (
                    <p className="text-xs text-muted-foreground">
                        {summary.description}
                    </p>
                )}
            </div>
            <Button variant="ghost" size="sm" onClick={onHide}>
                {QUESTIONNAIRE_EDITOR_TEXT.checkClose}
            </Button>
        </div>

        {summary.rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
                {QUESTIONNAIRE_EDITOR_TEXT.checkEmpty}
            </p>
        ) : (
            <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>
                                {QUESTIONNAIRE_EDITOR_TEXT.checkColumnItem}
                            </TableHead>
                            <TableHead>
                                {QUESTIONNAIRE_EDITOR_TEXT.checkColumnField}
                            </TableHead>
                            <TableHead>
                                {QUESTIONNAIRE_EDITOR_TEXT.checkColumnStatus}
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {summary.rows.map(row => (
                            <QuestionnaireCheckRow key={row.itemId} row={row} />
                        ))}
                    </TableBody>
                </Table>
            </div>
        )}
    </section>
);
