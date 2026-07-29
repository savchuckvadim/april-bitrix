'use client';

import React from 'react';
import { Input } from '@workspace/ui/components/input';
import { HowAnswer, HowQuestionnaireQuestion as QuestionData } from '../../constants/types';
import { optionPillClass } from '../../lib/option-pill-class.util';

interface HowQuestionnaireQuestionProps {
    index: number;
    question: QuestionData;
    answer: HowAnswer;
    onToggleChoice: (value: string) => void;
    onCustomChange: (value: string) => void;
    onCommentChange: (value: string) => void;
}

/** Один вопрос анкеты: варианты-кнопки, «свой вариант», комментарий. */
export const HowQuestionnaireQuestion: React.FC<
    HowQuestionnaireQuestionProps
> = ({
    index,
    question,
    answer,
    onToggleChoice,
    onCustomChange,
    onCommentChange,
}) => (
    <div className="rounded-xl border bg-card p-5">
        <p className="mb-3 font-semibold text-foreground">
            {index + 1}. {question.title}
        </p>
        <div
            className="flex flex-wrap gap-2"
            role="radiogroup"
            aria-label={question.title}
        >
            {question.options.map((option) => {
                const selected =
                    !answer.custom?.trim() && answer.choice === option.value;
                return (
                    <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => onToggleChoice(option.value)}
                        className={optionPillClass(
                            selected,
                            Boolean(option.recommended),
                        )}
                    >
                        {option.value}
                        {option.recommended && ' ✓'}
                    </button>
                );
            })}
        </div>
        {question.allowCustom && (
            <Input
                value={answer.custom ?? ''}
                onChange={(event) => onCustomChange(event.target.value)}
                placeholder="Свой вариант"
                className="mt-3"
            />
        )}
        {question.hint && (
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                {question.hint}
            </p>
        )}
        <Input
            value={answer.comment ?? ''}
            onChange={(event) => onCommentChange(event.target.value)}
            placeholder={
                question.commentPlaceholder ?? 'Комментарий (необязательно)'
            }
            className="mt-3"
        />
    </div>
);
