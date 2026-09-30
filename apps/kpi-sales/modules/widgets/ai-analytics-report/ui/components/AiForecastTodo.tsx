'use client';

import { ArrowRight } from 'lucide-react';
import { AI_FORECAST_TEXT } from '../../lib/ai-forecast.texts';
import type { AiTheoryTopic } from '../../lib/ai-theory-link';
import { AiTheoryLink } from './AiTheoryLink';

export interface AiForecastTheoryLink {
    topic: AiTheoryTopic;
    label?: string;
}

interface AiForecastTodoProps {
    /** Одна фраза «что делать». */
    text: string;
    /** Ссылки на теорию: тема и подпись (без подписи — «Подробнее в теории»). */
    links: readonly AiForecastTheoryLink[];
}

/** Подвал карточки прогноза: «Что делать» и ссылки на теорию. */
export const AiForecastTodo = ({ text, links }: AiForecastTodoProps) => (
    <div className="space-y-1 border-t border-border/60 pt-2">
        <p className="flex items-start gap-1 text-xs">
            <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
            <span>
                <span className="font-medium">
                    {AI_FORECAST_TEXT.todoLabel}:
                </span>{' '}
                {text}
            </span>
        </p>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
            {links.map(link => (
                <AiTheoryLink
                    key={link.topic}
                    topic={link.topic}
                    label={link.label}
                />
            ))}
        </div>
    </div>
);
