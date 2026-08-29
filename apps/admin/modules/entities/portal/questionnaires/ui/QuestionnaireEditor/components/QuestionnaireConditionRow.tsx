'use client';

import { Button } from '@workspace/ui/components/button';
import { Label } from '@workspace/ui/components/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { Trash2 } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { QUESTIONNAIRE_EDITOR_TEXT } from '../../../consts/questionnaires.const';
import type {
    PortalQuestionnaireCondition,
    QuestionnaireConditionKind,
    QuestionnaireConditionKindCode,
} from '../../../model';

interface QuestionnaireConditionRowProps {
    condition: PortalQuestionnaireCondition;
    /** Виды условий, доступные ЭТОЙ строке (свой + ещё не занятые). */
    kinds: QuestionnaireConditionKind[];
    onChangeKind: (kind: QuestionnaireConditionKindCode) => void;
    onToggleValue: (value: string) => void;
    onRemove: () => void;
}

/**
 * Одна строка условия показа: «вид условия ∈ выбранные значения».
 *
 * Значения — переключаемые чипсы, а не мультиселект: их немного, и владелец
 * должен видеть весь набор сразу, чтобы понимать, чего он НЕ выбрал.
 * Внутри строки значения объединяются по ИЛИ, строки между собой — по И.
 *
 * Виды и значения приходят из `GET /schema`: ни одного кода админка не
 * знает.
 */
export const QuestionnaireConditionRow = ({
    condition,
    kinds,
    onChangeKind,
    onToggleValue,
    onRemove,
}: QuestionnaireConditionRowProps) => {
    const descriptor = kinds.find(kind => kind.kind === condition.kind);
    const selected = condition.values ?? [];
    const values = descriptor?.values ?? [];

    return (
        <div className="space-y-3 rounded-lg border p-3">
            <div className="flex items-start gap-2">
                <div className="flex-1 space-y-1">
                    <Label>{QUESTIONNAIRE_EDITOR_TEXT.conditionKind}</Label>
                    <Select
                        value={condition.kind}
                        // Вид условия берётся из самого реестра, а не из
                        // строки селекта: там он уже типизирован.
                        onValueChange={value => {
                            const next = kinds.find(
                                kind => kind.kind === value,
                            );
                            if (next) onChangeKind(next.kind);
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {kinds.map(kind => (
                                <SelectItem key={kind.kind} value={kind.kind}>
                                    {kind.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {descriptor?.description && (
                        <p className="text-xs text-muted-foreground">
                            {descriptor.description}
                        </p>
                    )}
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    className="mt-6 text-destructive hover:text-destructive"
                    aria-label={QUESTIONNAIRE_EDITOR_TEXT.itemDrop}
                    onClick={onRemove}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            {/* «Всегда» значений не принимает — бэк такое тело отвергает. */}
            {values.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                    {QUESTIONNAIRE_EDITOR_TEXT.conditionNoValues}
                </p>
            ) : (
                <div className="space-y-1">
                    <Label>{QUESTIONNAIRE_EDITOR_TEXT.conditionValues}</Label>
                    <div className="flex flex-wrap gap-1.5">
                        {values.map(value => {
                            const isOn = selected.includes(value.code);
                            return (
                                <button
                                    key={value.code}
                                    type="button"
                                    aria-pressed={isOn}
                                    onClick={() => onToggleValue(value.code)}
                                    className={cn(
                                        'rounded-full border px-2.5 py-1 text-xs transition-colors',
                                        isOn
                                            ? 'border-primary bg-primary/10 text-foreground'
                                            : 'border-border text-muted-foreground hover:bg-muted',
                                    )}
                                >
                                    {value.name}
                                </button>
                            );
                        })}
                    </div>
                    {selected.length === 0 && (
                        <p className="text-xs text-destructive">
                            {QUESTIONNAIRE_EDITOR_TEXT.conditionAllValues}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};
