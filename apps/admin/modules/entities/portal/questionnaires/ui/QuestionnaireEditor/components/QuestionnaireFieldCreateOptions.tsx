'use client';

import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Plus, Trash2 } from 'lucide-react';
import { QUESTIONNAIRE_EDITOR_TEXT } from '../../../consts/questionnaires.const';
import type { QuestionnaireFieldCreateOption } from '../../../lib/field-create-view';

interface QuestionnaireFieldCreateOptionsProps {
    options: QuestionnaireFieldCreateOption[];
    disabled: boolean;
    onChangeTitle: (key: string, title: string) => void;
    onAdd: () => void;
    onRemove: (key: string) => void;
}

/**
 * Значения справочника нового поля.
 *
 * Владелец набирает только подписи: символьный код собирается из подписи
 * транслитом, а идентификатор значения выдаёт сам Битрикс при создании —
 * придуманный руками потерял бы ответ молча.
 */
export const QuestionnaireFieldCreateOptions = ({
    options,
    disabled,
    onChangeTitle,
    onAdd,
    onRemove,
}: QuestionnaireFieldCreateOptionsProps) => (
    <div className="space-y-2 rounded-lg border p-3">
        <div className="flex items-center justify-between gap-2">
            <Label>{QUESTIONNAIRE_EDITOR_TEXT.createFieldOptionsLabel}</Label>
            <Button
                variant="outline"
                size="sm"
                disabled={disabled}
                onClick={onAdd}
            >
                <Plus className="h-4 w-4" />
                {QUESTIONNAIRE_EDITOR_TEXT.optionAdd}
            </Button>
        </div>

        <p className="text-xs text-muted-foreground">
            {QUESTIONNAIRE_EDITOR_TEXT.createFieldOptionsHint}
        </p>

        <ul className="space-y-2">
            {options.map(option => (
                <li key={option.key} className="flex items-center gap-2">
                    <Input
                        className="flex-1"
                        aria-label={QUESTIONNAIRE_EDITOR_TEXT.optionTitleLabel}
                        placeholder={
                            QUESTIONNAIRE_EDITOR_TEXT.createFieldOptionPlaceholder
                        }
                        value={option.title}
                        disabled={disabled}
                        onChange={event =>
                            onChangeTitle(option.key, event.target.value)
                        }
                    />
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        aria-label={QUESTIONNAIRE_EDITOR_TEXT.optionRemove}
                        disabled={disabled || options.length === 1}
                        onClick={() => onRemove(option.key)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </li>
            ))}
        </ul>
    </div>
);
