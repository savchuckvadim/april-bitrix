'use client';

import React from 'react';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import {
    HowAnswer,
    HowQuestionnaireQuestion as QuestionData,
} from '../../constants/types';
import { HOW_QUESTIONNAIRE_COPY } from '../../constants/questionnaire-copy';
import { optionPillClass } from '../../lib/option-pill-class.util';

interface HowQuestionnaireQuestionProps {
    index: number;
    question: QuestionData;
    answer: HowAnswer;
    onToggleChoice: (value: string) => void;
    /** Чекбокс вопроса `multi` */
    onToggleValue: (value: string) => void;
    onCustomChange: (value: string) => void;
    onCommentChange: (value: string) => void;
}

/**
 * Один вопрос анкеты. `choice` — варианты-кнопки, «свой вариант» и
 * комментарий; `multi` — те же кнопки, но отмечать можно несколько;
 * `text` — многострочное поле; `link` — поле ссылки.
 * У свободных видов и у `multi` комментария нет: сам ответ и есть
 * комментарий.
 */
export const HowQuestionnaireQuestion: React.FC<
    HowQuestionnaireQuestionProps
> = ({
    index,
    question,
    answer,
    onToggleChoice,
    onToggleValue,
    onCustomChange,
    onCommentChange,
}) => {
    const kind = question.kind ?? 'choice';
    return (
        <div className="rounded-xl border bg-card p-5">
            <p className="mb-3 font-semibold text-foreground">
                {index + 1}. {question.title}
                {question.required && (
                    <span className="ml-2 align-middle text-xs font-normal text-primary">
                        {HOW_QUESTIONNAIRE_COPY.requiredMark}
                    </span>
                )}
            </p>
            {kind === 'choice' && (
                <div
                    className="flex flex-wrap gap-2"
                    role="radiogroup"
                    aria-label={question.title}
                >
                    {question.options.map((option) => {
                        const selected =
                            !answer.custom?.trim() &&
                            answer.choice === option.value;
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
            )}
            {kind === 'multi' && (
                <div
                    className="flex flex-wrap gap-2"
                    role="group"
                    aria-label={question.title}
                >
                    {question.options.map((option) => {
                        const selected = Boolean(
                            answer.values?.includes(option.value),
                        );
                        return (
                            <button
                                key={option.value}
                                type="button"
                                role="checkbox"
                                aria-checked={selected}
                                onClick={() => onToggleValue(option.value)}
                                className={optionPillClass(selected, false)}
                            >
                                {option.value}
                            </button>
                        );
                    })}
                </div>
            )}
            {kind === 'choice' && question.allowCustom && (
                <Input
                    value={answer.custom ?? ''}
                    onChange={(event) => onCustomChange(event.target.value)}
                    placeholder={question.placeholder ?? 'Свой вариант'}
                    maxLength={question.maxLength}
                    className="mt-3"
                />
            )}
            {kind === 'text' && (
                <Textarea
                    value={answer.custom ?? ''}
                    onChange={(event) => onCustomChange(event.target.value)}
                    placeholder={question.placeholder ?? 'Ваш ответ'}
                    maxLength={question.maxLength}
                    aria-label={question.title}
                />
            )}
            {kind === 'link' && (
                <Input
                    type="url"
                    inputMode="url"
                    value={answer.custom ?? ''}
                    onChange={(event) => onCustomChange(event.target.value)}
                    placeholder={question.placeholder ?? 'https://…'}
                    maxLength={question.maxLength}
                    aria-label={question.title}
                />
            )}
            {question.hint && (
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    {question.hint}
                </p>
            )}
            {kind === 'choice' && (
                <Input
                    value={answer.comment ?? ''}
                    onChange={(event) => onCommentChange(event.target.value)}
                    placeholder={
                        question.commentPlaceholder ??
                        'Комментарий (необязательно)'
                    }
                    className="mt-3"
                />
            )}
        </div>
    );
};
