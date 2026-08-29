'use client';

import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { QUESTIONNAIRE_EDITOR_TEXT } from '../../../consts/questionnaires.const';
import type { PortalQuestionnaireOptionSave } from '../../../model';
import { QUESTIONNAIRE_FIELD_BOUND_CHANNELS } from '../../../model';
import { uniqueItemCode } from '../../../lib/build-item-from-field';

interface QuestionnaireItemOptionsProps {
    options: PortalQuestionnaireOptionSave[];
    /** Канал записи ответа: в поле уезжает bitrixId элемента списка. */
    channel: string;
    onChange: (options: PortalQuestionnaireOptionSave[]) => void;
}

/**
 * Варианты справочника у типа отображения «Список».
 *
 * `bitrixId` показывается, но руками не правится: это идентификатор
 * элемента списка в Битриксе, и именно он уезжает в `crm.*.update`.
 * Придуманный вручную идентификатор молча потерял бы ответ — поэтому
 * варианты каналов «Поле CRM» и «Поле элемента смарта» приходят из самого
 * поля, а без идентификатора вариант помечен и сохранение не пройдёт.
 */
export const QuestionnaireItemOptions = ({
    options,
    channel,
    onChange,
}: QuestionnaireItemOptionsProps) => {
    const isFieldBound = QUESTIONNAIRE_FIELD_BOUND_CHANNELS.some(
        bound => bound === channel,
    );

    const patchOption = (
        index: number,
        patch: Partial<PortalQuestionnaireOptionSave>,
    ) =>
        onChange(
            options.map((option, position) =>
                position === index ? { ...option, ...patch } : option,
            ),
        );

    return (
        <div className="space-y-2 rounded-lg border p-3">
            <div className="flex items-center justify-between gap-2">
                <Label>{QUESTIONNAIRE_EDITOR_TEXT.optionsTitle}</Label>
                {/* Вариант без bitrixId в поле не запишется, поэтому руками
                    их добавляют только для ответа в комментарий события. */}
                {!isFieldBound && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            onChange([
                                ...options,
                                {
                                    code: uniqueItemCode(
                                        'option',
                                        options.map(option => option.code),
                                    ),
                                    title: '',
                                    bitrixId: null,
                                    xmlId: null,
                                    sort: (options.length + 1) * 10,
                                    isDefault: false,
                                    isActive: true,
                                },
                            ])
                        }
                    >
                        <Plus className="h-4 w-4" />
                        {QUESTIONNAIRE_EDITOR_TEXT.optionAdd}
                    </Button>
                )}
            </div>

            <p className="text-xs text-muted-foreground">
                {QUESTIONNAIRE_EDITOR_TEXT.optionsHint}
            </p>

            {options.length === 0 ? (
                <p className="text-xs text-destructive">
                    {QUESTIONNAIRE_EDITOR_TEXT.optionsEmpty}
                </p>
            ) : (
                <ul className="space-y-2">
                    {options.map((option, index) => (
                        <li
                            key={option.code}
                            className={cn(
                                'flex items-center gap-2',
                                // Погашенный вариант менеджеру не
                                // показывается — в редакторе он обязан
                                // отличаться от живого, иначе владелец
                                // правит подпись тому, чего уже нет.
                                option.isActive === false && 'opacity-60',
                            )}
                        >
                            <Input
                                className="flex-1"
                                aria-label={
                                    QUESTIONNAIRE_EDITOR_TEXT.optionTitleLabel
                                }
                                value={option.title}
                                onChange={event =>
                                    patchOption(index, {
                                        title: event.target.value,
                                    })
                                }
                            />
                            {option.bitrixId !== null &&
                            option.bitrixId !== undefined ? (
                                <Badge
                                    variant="secondary"
                                    className="font-mono"
                                    title={
                                        QUESTIONNAIRE_EDITOR_TEXT.optionsHint
                                    }
                                >
                                    {option.bitrixId}
                                </Badge>
                            ) : (
                                <Badge
                                    variant={
                                        isFieldBound ? 'destructive' : 'outline'
                                    }
                                >
                                    {QUESTIONNAIRE_EDITOR_TEXT.optionNoBitrixId}
                                </Badge>
                            )}
                            {option.isActive === false && (
                                <Badge
                                    variant="outline"
                                    title={
                                        QUESTIONNAIRE_EDITOR_TEXT.optionDisabledHint
                                    }
                                >
                                    {QUESTIONNAIRE_EDITOR_TEXT.optionDisabled}
                                </Badge>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                aria-label={
                                    QUESTIONNAIRE_EDITOR_TEXT.optionRemove
                                }
                                onClick={() =>
                                    onChange(
                                        options.filter(
                                            (_item, position) =>
                                                position !== index,
                                        ),
                                    )
                                }
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
