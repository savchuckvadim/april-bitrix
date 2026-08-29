'use client';

import { Label } from '@workspace/ui/components/label';
import { QUESTIONNAIRE_EDITOR_TEXT } from '../../../consts/questionnaires.const';
import type { PortalQuestionnaireSchema } from '../../../model';
import { QUESTIONNAIRE_CODE } from '../../../model';
import { optionName } from '../../../lib/questionnaire-list-view';

interface QuestionnaireItemSmartTargetProps {
    schema: PortalQuestionnaireSchema | undefined;
}

/**
 * Носитель ответа у канала «Поле элемента смарта».
 *
 * Выбирать здесь нечего, и селекта нет намеренно: ответ уедет в тот
 * элемент, который создаёт или закрывает поток события, а какой это смарт —
 * задаёт выбранное поле. Пустое место на этой позиции читалось бы как
 * «носитель не задан», поэтому он назван словами реестра.
 */
export const QuestionnaireItemSmartTarget = ({
    schema,
}: QuestionnaireItemSmartTargetProps) => (
    <div className="space-y-1">
        <Label>{QUESTIONNAIRE_EDITOR_TEXT.itemTargetEntityLabel}</Label>
        <p className="text-sm">
            {optionName(
                schema?.targetEntities,
                QUESTIONNAIRE_CODE.targetEntity.smart,
            )}
        </p>
        <p className="text-xs text-muted-foreground">
            {QUESTIONNAIRE_EDITOR_TEXT.itemSmartTargetHint}
        </p>
    </div>
);
