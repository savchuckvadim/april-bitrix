'use client';

import { Button } from '@workspace/ui/components/button';
import { Plus, TriangleAlert } from 'lucide-react';
import { QUESTIONNAIRE_EDITOR_TEXT } from '../../../consts/questionnaires.const';
import type {
    PortalQuestionnaireCondition,
    PortalQuestionnaireSchema,
} from '../../../model';
import type { QuestionnaireDraft } from '../../../lib/questionnaire-draft';
import { QuestionnaireConditionRow } from './QuestionnaireConditionRow';
import { QuestionnaireConditionsPreview } from './QuestionnaireConditionsPreview';

interface QuestionnaireConditionsCardProps {
    draft: QuestionnaireDraft;
    schema: PortalQuestionnaireSchema | undefined;
    onChange: (conditions: PortalQuestionnaireCondition[]) => void;
}

/**
 * Конструктор условий показа.
 *
 * Условия объединяются по И, поэтому вид условия в анкете не повторяется:
 * селект каждой строки показывает свой вид плюс ещё не занятые. Пустой
 * список бэк отвергает — об этом сказано подсказкой сразу, а не ошибкой
 * после нажатия «Сохранить».
 */
export const QuestionnaireConditionsCard = ({
    draft,
    schema,
    onChange,
}: QuestionnaireConditionsCardProps) => {
    const kinds = schema?.conditions ?? [];
    const conditions = draft.conditions ?? [];
    const takenKinds = conditions.map(condition => condition.kind);
    const freeKinds = kinds.filter(kind => !takenKinds.includes(kind.kind));

    const patchCondition = (
        index: number,
        patch: Partial<PortalQuestionnaireCondition>,
    ) =>
        onChange(
            conditions.map((condition, position) =>
                position === index ? { ...condition, ...patch } : condition,
            ),
        );

    const addCondition = () => {
        const next = freeKinds[0];
        if (!next) return;
        onChange([...conditions, { kind: next.kind, values: [] }]);
    };

    return (
        <section className="space-y-4 rounded-lg border p-4">
            <div>
                <h2 className="font-semibold">
                    {QUESTIONNAIRE_EDITOR_TEXT.conditionsTitle}
                </h2>
                <p className="text-sm text-muted-foreground">
                    {QUESTIONNAIRE_EDITOR_TEXT.conditionsHint}
                </p>
            </div>

            {conditions.length === 0 && (
                <p className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                    <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                    {QUESTIONNAIRE_EDITOR_TEXT.conditionsEmptyWarning}
                </p>
            )}

            <div className="space-y-3">
                {conditions.map((condition, index) => (
                    <QuestionnaireConditionRow
                        key={condition.kind}
                        condition={condition}
                        // Свой вид плюс свободные: занятый чужой строкой
                        // выбрать нельзя — условия объединяются по И.
                        kinds={kinds.filter(
                            kind =>
                                kind.kind === condition.kind ||
                                !takenKinds.includes(kind.kind),
                        )}
                        onChangeKind={kind =>
                            // Значения принадлежат виду условия: при смене
                            // вида прежние коды к новому справочнику не
                            // относятся.
                            patchCondition(index, { kind, values: [] })
                        }
                        onToggleValue={value => {
                            const selected = condition.values ?? [];
                            patchCondition(index, {
                                values: selected.includes(value)
                                    ? selected.filter(item => item !== value)
                                    : [...selected, value],
                            });
                        }}
                        onRemove={() =>
                            onChange(
                                conditions.filter(
                                    (_item, position) => position !== index,
                                ),
                            )
                        }
                    />
                ))}
            </div>

            <Button
                variant="outline"
                size="sm"
                disabled={freeKinds.length === 0}
                title={
                    freeKinds.length === 0
                        ? QUESTIONNAIRE_EDITOR_TEXT.conditionTaken
                        : undefined
                }
                onClick={addCondition}
            >
                <Plus className="h-4 w-4" />
                {QUESTIONNAIRE_EDITOR_TEXT.addCondition}
            </Button>

            <QuestionnaireConditionsPreview draft={draft} schema={schema} />
        </section>
    );
};
