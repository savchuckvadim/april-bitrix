'use client';

import type { FC } from 'react';
import { Check, Wand2 } from 'lucide-react';
import { Label } from '@workspace/ui/components/label';
import {
    RadioGroup,
    RadioGroupItem,
} from '@workspace/ui/components/radio-group';
import { cn } from '@workspace/ui/lib/utils';
import { questionAnchorId } from '../lib/anchors.util';
import type { ProcessQuestion } from '../types';

interface QuestionCardProps {
    question: ProcessQuestion;
    /** Выбранный код варианта, если ответ дан. */
    choice: string | undefined;
    onAnswer: (questionId: string, code: string) => void;
}

/**
 * Один вопрос конфигурации — настоящий радио-список, а не набор пилюль.
 *
 * Это осознанный выбор: пилюли читаются как «можно потыкать», а тут решения
 * фиксируются на внедрении, и неотвеченный вопрос — это дыра в регламенте.
 * Поэтому неотвеченный вопрос подсвечен, помечен звёздочкой и не даёт о себе
 * забыть, а отвеченный получает галочку.
 */
export const QuestionCard: FC<QuestionCardProps> = ({
    question,
    choice,
    onAnswer,
}) => {
    const isAnswered = Boolean(choice);
    const isRequired = question.isActive && !isAnswered;

    return (
        <fieldset
            id={questionAnchorId(question.id)}
            className={cn(
                'flex flex-col scroll-mt-24 rounded-xl border-2 p-3 transition-colors',
                // Подсветку ставит useScrollToTarget, когда читатель пришёл
                // сюда из теории по кнопке «Посмотреть на схеме».
                'data-[highlighted=true]:ring-primary data-[highlighted=true]:ring-4 data-[highlighted=true]:ring-offset-2 data-[highlighted=true]:ring-offset-background',
                !question.isActive && 'bg-muted/30 border-dashed opacity-80',
                isRequired && 'border-warning/70 bg-warning/5',
                question.isActive && isAnswered && 'border-success/40 bg-card',
            )}
        >
            <legend className="sr-only">{question.title}</legend>

            <div className="flex items-start justify-between gap-2">
                <p
                    className={cn(
                        'text-sm leading-snug font-semibold text-balance',
                        question.isActive
                            ? 'text-foreground'
                            : 'text-muted-foreground',
                    )}
                >
                    {question.title}
                    {isRequired && (
                        <span className="text-warning" aria-hidden>
                            {' '}
                            *
                        </span>
                    )}
                </p>

                {!question.isActive ? (
                    <span
                        title={question.inactiveReason}
                        className="border-warning/50 text-warning shrink-0 rounded-full border border-dashed px-1.5 py-0.5 text-[10px] whitespace-nowrap"
                    >
                        пока выключен
                    </span>
                ) : isAnswered ? (
                    <Check
                        className="text-success mt-0.5 size-4 shrink-0"
                        aria-label="отвечено"
                    />
                ) : (
                    <span className="bg-warning/15 text-warning shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold whitespace-nowrap">
                        нужен ответ
                    </span>
                )}
            </div>

            <p
                className={cn(
                    'mt-1 flex items-center gap-1.5 text-xs',
                    question.isActive
                        ? 'text-primary'
                        : 'text-muted-foreground/70',
                )}
            >
                <Wand2 className="size-3 shrink-0" aria-hidden />
                {question.changes}
            </p>

            <RadioGroup
                value={choice ?? ''}
                onValueChange={code => onAnswer(question.id, code)}
                disabled={!question.isActive}
                aria-label={question.title}
                aria-required={question.isActive}
                className="mt-2.5 gap-1.5"
            >
                {question.options.map(option => {
                    const id = `${question.id}-${option.code}`;
                    const isSelected = option.code === choice;

                    return (
                        <div
                            key={option.code}
                            className={cn(
                                'flex items-start gap-2 rounded-lg border px-2.5 py-1.5 transition-colors',
                                isSelected
                                    ? 'border-primary bg-primary/10'
                                    : 'border-transparent',
                                question.isActive &&
                                    !isSelected &&
                                    'hover:border-primary/40 hover:bg-primary/5',
                            )}
                        >
                            <RadioGroupItem
                                id={id}
                                value={option.code}
                                className={cn(
                                    'mt-0.5',
                                    question.isActive && 'cursor-pointer',
                                )}
                            />
                            <Label
                                htmlFor={id}
                                className={cn(
                                    'text-xs leading-snug font-normal',
                                    question.isActive
                                        ? 'cursor-pointer'
                                        : 'cursor-not-allowed',
                                    isSelected && 'text-primary font-semibold',
                                    option.recommended &&
                                        !isSelected &&
                                        'text-success',
                                )}
                            >
                                {option.label}
                                {option.recommended && (
                                    <span className="text-success font-bold">
                                        {' '}
                                        ✓ рекомендуем
                                    </span>
                                )}
                            </Label>
                        </div>
                    );
                })}
            </RadioGroup>

            {question.hint && question.isActive && (
                <p className="text-muted-foreground mt-2 text-[11px] leading-snug">
                    {question.hint}
                </p>
            )}

            {!question.isActive && question.inactiveReason && (
                <p className="text-muted-foreground/70 mt-2 text-[11px] leading-snug">
                    {question.inactiveReason}
                </p>
            )}
        </fieldset>
    );
};
