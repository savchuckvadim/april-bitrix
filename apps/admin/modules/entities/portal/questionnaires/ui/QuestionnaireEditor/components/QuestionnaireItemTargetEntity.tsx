'use client';

import { Label } from '@workspace/ui/components/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { QUESTIONNAIRE_EDITOR_TEXT } from '../../../consts/questionnaires.const';
import type {
    PortalQuestionnaireItemSave,
    PortalQuestionnaireSchema,
} from '../../../model';
import {
    QUESTIONNAIRE_CODE,
    pickQuestionnaireCode,
    questionnaireCodeOptions,
} from '../../../model';
import { getTargetEntityLock } from '../../../lib/item-editor-view';

interface QuestionnaireItemTargetEntityProps {
    item: PortalQuestionnaireItemSave;
    schema: PortalQuestionnaireSchema | undefined;
    onPatch: (patch: Partial<PortalQuestionnaireItemSave>) => void;
}

/**
 * Сущность-носитель ответа в CRM.
 *
 * Заперта, пока носитель выбирается автоматически: цепочку компания →
 * сделка → лид фрейм проходит сам, и жёсткая сущность нужна только полю
 * вне этой цепочки. Причина запрета написана под селектом — иначе
 * выключенный контрол выглядел бы поломкой.
 */
export const QuestionnaireItemTargetEntity = ({
    item,
    schema,
    onPatch,
}: QuestionnaireItemTargetEntityProps) => {
    // Подписи и порядок — из реестра, коды сужены до контракта.
    const targetEntities = questionnaireCodeOptions(
        QUESTIONNAIRE_CODE.targetEntity,
        schema?.targetEntities,
    );
    const lock = getTargetEntityLock(item);

    return (
        <div className="space-y-1">
            <Label>{QUESTIONNAIRE_EDITOR_TEXT.itemTargetEntityLabel}</Label>
            <Select
                value={item.targetEntity ?? ''}
                disabled={!!lock}
                onValueChange={value => {
                    const next = pickQuestionnaireCode(
                        QUESTIONNAIRE_CODE.targetEntity,
                        value,
                    );
                    if (next) onPatch({ targetEntity: next });
                }}
            >
                <SelectTrigger>
                    <SelectValue
                        placeholder={
                            QUESTIONNAIRE_EDITOR_TEXT.itemTargetEntityLabel
                        }
                    />
                </SelectTrigger>
                <SelectContent>
                    {targetEntities.map(option => (
                        <SelectItem key={option.code} value={option.code}>
                            {option.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {lock && <p className="text-xs text-muted-foreground">{lock}</p>}
        </div>
    );
};
