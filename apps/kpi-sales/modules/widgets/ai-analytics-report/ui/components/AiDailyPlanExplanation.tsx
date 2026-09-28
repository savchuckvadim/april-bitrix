'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@workspace/ui/components/collapsible';
import { cn } from '@workspace/ui/lib/utils';
import { ToneBadge } from '@workspace/april-ui';
import type { AiDailyPlanExplanation as AiDailyPlanExplanationData } from '@/modules/entities/ai-analytics';
import {
    AI_DAILY_PLAN_STEP_LABEL,
    formatAiPlanNumber,
} from '../../lib/ai-daily-plan.util';

interface AiDailyPlanExplanationProps {
    explanation: AiDailyPlanExplanationData;
}

/**
 * «Как посчитано» — свёрнуто по умолчанию: строка бэка и шаги «Цель →
 * Закрыто → Принесут сделки в работе → Нужно активности → По воронке →
 * Лимит дня» (value null — «—»). Простой заголовок плана показывает
 * карточка, подробности — только здесь.
 */
export const AiDailyPlanExplanation = ({
    explanation,
}: AiDailyPlanExplanationProps) => {
    const [open, setOpen] = useState(false);

    if (!explanation.text && !explanation.steps.length) return null;

    return (
        <Collapsible open={open} onOpenChange={setOpen} className="space-y-2">
            <CollapsibleTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 px-2 text-xs"
                >
                    Как посчитано
                    <ChevronDown
                        className={cn(
                            'h-3 w-3 transition-transform',
                            open && 'rotate-180',
                        )}
                    />
                </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2">
                {explanation.text && (
                    <p className="text-xs text-muted-foreground">
                        {explanation.text}
                    </p>
                )}
                {explanation.steps.length > 0 && (
                    <ol className="space-y-1 text-xs">
                        {explanation.steps.map(step => (
                            <li
                                key={step.code}
                                className="flex flex-wrap items-center gap-2"
                            >
                                <ToneBadge
                                    tone="muted"
                                    variant="outline"
                                    size="sm"
                                >
                                    {AI_DAILY_PLAN_STEP_LABEL[step.code]}
                                </ToneBadge>
                                <span>{step.text}</span>
                                <span className="text-muted-foreground tabular-nums">
                                    {step.value === null
                                        ? '—'
                                        : formatAiPlanNumber(step.value)}
                                </span>
                            </li>
                        ))}
                    </ol>
                )}
            </CollapsibleContent>
        </Collapsible>
    );
};
