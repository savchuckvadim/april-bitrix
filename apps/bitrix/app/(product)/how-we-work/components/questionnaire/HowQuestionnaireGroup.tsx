'use client';

import React from 'react';
import { HowAnswer } from '../../constants/types';
import { HowQuestionGroup } from '../../lib/group-questions';
import { HowQuestionnaireQuestion } from './HowQuestionnaireQuestion';

interface HowQuestionnaireGroupProps {
    group: HowQuestionGroup;
    answers: Record<string, HowAnswer>;
    onToggleChoice: (questionId: string, value: string) => void;
    onCustomChange: (questionId: string, value: string) => void;
    onCommentChange: (questionId: string, value: string) => void;
}

/** Раздел анкеты: заголовок (если есть) и его вопросы. */
export const HowQuestionnaireGroup: React.FC<HowQuestionnaireGroupProps> = ({
    group,
    answers,
    onToggleChoice,
    onCustomChange,
    onCommentChange,
}) => (
    <div className="space-y-4">
        {group.title && (
            <h4 className="pt-4 text-base font-bold text-foreground">
                {group.title}
            </h4>
        )}
        {group.items.map(({ question, index }) => (
            <HowQuestionnaireQuestion
                key={question.id}
                index={index}
                question={question}
                answer={answers[question.id] ?? {}}
                onToggleChoice={(value) => onToggleChoice(question.id, value)}
                onCustomChange={(value) => onCustomChange(question.id, value)}
                onCommentChange={(value) =>
                    onCommentChange(question.id, value)
                }
            />
        ))}
    </div>
);
