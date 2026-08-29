'use client';

import { TriangleAlert } from 'lucide-react';
import { QUESTIONNAIRE_EDITOR_TEXT } from '../../../consts/questionnaires.const';
import type { QuestionnaireDraftIssue } from '../../../lib/validate-questionnaire-draft';

interface QuestionnaireIssuesPanelProps {
    issues: QuestionnaireDraftIssue[];
}

/**
 * Что мешает сохранить анкету.
 *
 * Список собран теми же правилами, что проверяет бэк, и теми же словами:
 * владелец видит причину до нажатия «Сохранить», а не разбирает отказ
 * сервера. Бэк падает на первом нарушении — здесь показаны все сразу,
 * иначе исправление превратилось бы в переписку с сервером.
 */
export const QuestionnaireIssuesPanel = ({
    issues,
}: QuestionnaireIssuesPanelProps) => {
    if (issues.length === 0) return null;

    return (
        <section className="space-y-2 rounded-lg border border-destructive/40 bg-destructive/5 p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-destructive">
                <TriangleAlert className="h-4 w-4" />
                {QUESTIONNAIRE_EDITOR_TEXT.issuesTitle}
            </p>
            <p className="text-xs text-muted-foreground">
                {QUESTIONNAIRE_EDITOR_TEXT.issuesHint}
            </p>
            <ul className="list-disc space-y-1 pl-5">
                {issues.map((issue, position) => (
                    <li
                        key={`${issue.itemCode ?? issue.scope}-${position}`}
                        className="text-sm text-destructive"
                    >
                        {issue.message}
                    </li>
                ))}
            </ul>
        </section>
    );
};
