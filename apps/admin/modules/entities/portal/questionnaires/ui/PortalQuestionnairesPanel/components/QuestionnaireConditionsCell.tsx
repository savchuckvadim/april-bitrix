'use client';

import { Badge } from '@workspace/ui/components/badge';
import { QUESTIONNAIRES_TEXT } from '../../../consts/questionnaires.const';
import type { QuestionnaireRow } from '../../../lib/questionnaire-list-view';

interface QuestionnaireConditionsCellProps {
    row: QuestionnaireRow;
}

/**
 * Условия показа чипсами. Подписи вида условия и его значений приходят из
 * реестра `GET /schema` — админка их не хардкодит, поэтому новый вид
 * условия появляется здесь сам собой.
 *
 * Условий в списке бэка нет: они приезжают вместе с составом анкеты
 * отдельным запросом, отсюда состояние «ещё грузим».
 */
export const QuestionnaireConditionsCell = ({
    row,
}: QuestionnaireConditionsCellProps) => {
    if (row.isDetailLoading) {
        return (
            <span className="text-xs text-muted-foreground">
                {QUESTIONNAIRES_TEXT.conditionsLoading}
            </span>
        );
    }

    if (row.conditions.length === 0) {
        return (
            <span className="text-xs text-muted-foreground">
                {QUESTIONNAIRES_TEXT.conditionsEmpty}
            </span>
        );
    }

    return (
        <div className="flex max-w-xs flex-wrap gap-1">
            {row.conditions.map(condition => (
                <Badge
                    key={condition.kind}
                    variant="outline"
                    title={condition.title}
                    className="max-w-full truncate"
                >
                    {condition.label}
                </Badge>
            ))}
        </div>
    );
};
