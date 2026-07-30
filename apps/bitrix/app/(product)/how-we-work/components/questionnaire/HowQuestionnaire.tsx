'use client';

import React from 'react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Download, Copy, RotateCcw } from 'lucide-react';
import { HowQuestionnaire as QuestionnaireData } from '../../constants/types';
import { useHowQuestionnaire } from './useHowQuestionnaire';
import { HowQuestionnaireQuestion } from './HowQuestionnaireQuestion';

interface HowQuestionnaireProps {
    questionnaire: QuestionnaireData;
}

/**
 * Интерактивная анкета внедрения: клиент отмечает варианты, пишет свои,
 * а затем скачивает или копирует готовый протокол решений.
 */
export const HowQuestionnaire: React.FC<HowQuestionnaireProps> = ({
    questionnaire,
}) => {
    const {
        state,
        status,
        answeredCount,
        setRespondent,
        setCompany,
        setAnswer,
        toggleChoice,
        download,
        copy,
        reset,
    } = useHowQuestionnaire(questionnaire);

    return (
        <section className="space-y-4">
            <div>
                <h3 className="text-lg font-bold text-foreground">
                    {questionnaire.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    {questionnaire.description}
                </p>
            </div>

            {questionnaire.questions.map((question, index) => (
                <HowQuestionnaireQuestion
                    key={question.id}
                    index={index}
                    question={question}
                    answer={state.answers[question.id] ?? {}}
                    onToggleChoice={(value) =>
                        toggleChoice(question.id, value)
                    }
                    onCustomChange={(custom) =>
                        setAnswer(question.id, { custom, choice: undefined })
                    }
                    onCommentChange={(comment) =>
                        setAnswer(question.id, { comment })
                    }
                />
            ))}

            <div className="rounded-xl border bg-card p-5">
                <div className="grid gap-3 sm:grid-cols-2">
                    <Input
                        value={state.company}
                        onChange={(event) => setCompany(event.target.value)}
                        placeholder="Организация"
                        aria-label="Организация"
                    />
                    <Input
                        value={state.respondent}
                        onChange={(event) => setRespondent(event.target.value)}
                        placeholder="Ваше имя и должность"
                        aria-label="Ваше имя и должность"
                    />
                </div>
                <p className="mt-3 text-sm font-semibold text-primary">
                    Отвечено {answeredCount} из{' '}
                    {questionnaire.questions.length}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Button onClick={download}>
                        <Download className="mr-1.5 h-4 w-4" />
                        Скачать протокол
                    </Button>
                    <Button variant="outline" onClick={copy}>
                        <Copy className="mr-1.5 h-4 w-4" />
                        Скопировать
                    </Button>
                    <Button variant="ghost" onClick={reset}>
                        <RotateCcw className="mr-1.5 h-4 w-4" />
                        Сбросить
                    </Button>
                    {status && (
                        <span
                            className="text-sm text-muted-foreground"
                            role="status"
                        >
                            {status}
                        </span>
                    )}
                </div>
            </div>
        </section>
    );
};
