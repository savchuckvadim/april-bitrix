'use client';

import type { FC } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import type { ProcessQuestion } from '../types';
import { QuestionCard } from './QuestionCard';

interface QuestionPanelProps {
    questions: ProcessQuestion[];
    answers: Record<string, string>;
    onAnswer: (questionId: string, code: string) => void;
    className?: string;
}

/**
 * Вопросы конфигурации портала. Активные меняют схему прямо сейчас, выключенные
 * показывают замысел целиком — включим их, когда за ними появится механика.
 */
export const QuestionPanel: FC<QuestionPanelProps> = ({
    questions,
    answers,
    onAnswer,
    className,
}) => {
    const active = questions.filter(question => question.isActive);
    const inactive = questions.filter(question => !question.isActive);
    const unanswered = active.filter(question => !answers[question.id]).length;

    return (
        <section className={cn('flex flex-col gap-3', className)}>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <h2 className="text-foreground text-sm font-bold tracking-widest uppercase">
                    Регламент портала
                </h2>

                {unanswered > 0 ? (
                    <span className="border-warning/50 bg-warning/10 text-warning rounded-full border px-2.5 py-0.5 text-xs font-bold">
                        не отвечено: {unanswered} из {active.length}
                    </span>
                ) : (
                    <span className="border-success/50 bg-success/10 text-success rounded-full border px-2.5 py-0.5 text-xs font-bold">
                        ответы даны на все {active.length}
                    </span>
                )}

                <p className="text-muted-foreground text-xs">
                    каждый ответ что-то меняет на схеме ниже и попадает в
                    регламент
                </p>
            </div>

            <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
                {active.map(question => (
                    <QuestionCard
                        key={question.id}
                        question={question}
                        choice={answers[question.id]}
                        onAnswer={onAnswer}
                    />
                ))}
            </div>

            {inactive.length > 0 && (
                <details className="group">
                    <summary className="text-muted-foreground hover:text-foreground cursor-pointer text-xs font-semibold">
                        Ещё {inactive.length} вопроса — объявлены, но пока
                        выключены
                    </summary>

                    <div className="mt-3 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
                        {inactive.map(question => (
                            <QuestionCard
                                key={question.id}
                                question={question}
                                choice={answers[question.id]}
                                onAnswer={onAnswer}
                            />
                        ))}
                    </div>
                </details>
            )}
        </section>
    );
};
