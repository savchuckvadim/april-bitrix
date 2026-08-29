'use client';

import { Badge } from '@workspace/ui/components/badge';
import { QUESTIONNAIRES_TEXT } from '../../../consts/questionnaires.const';
import type { QuestionnaireRow } from '../../../lib/questionnaire-list-view';

interface QuestionnaireIssuesCellProps {
    row: QuestionnaireRow;
}

/**
 * Сломанные привязки последней сверки. Число считает бэк (`issuesCount`) —
 * это вопросы канала «Поле CRM», которые в каталог фрейма не попадут.
 */
export const QuestionnaireIssuesCell = ({
    row,
}: QuestionnaireIssuesCellProps) => {
    if (row.issuesCount === 0) {
        return (
            <span
                className="text-xs text-muted-foreground"
                title={QUESTIONNAIRES_TEXT.issuesNone}
            >
                —
            </span>
        );
    }

    return (
        <Badge variant="destructive" title={QUESTIONNAIRES_TEXT.issuesHint}>
            {row.issuesCount}
        </Badge>
    );
};
