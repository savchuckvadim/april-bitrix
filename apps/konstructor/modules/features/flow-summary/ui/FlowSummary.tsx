'use client';

import type { ReactNode } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import { useFlowStepActions } from '../hooks/use-flow-step-actions';

export interface FlowSummaryProps {
    title?: string;
    /** Действие экрана перед переходом; false — остаться на шаге. */
    onNext?: () => boolean | Promise<boolean>;
    nextDisabled?: boolean;
    /** Почему дальше нельзя или что произойдёт по кнопке. */
    hint?: ReactNode;
    /** Кнопки над переходом: «Сохранить», «Комплект», «Цены». */
    actions?: ReactNode;
    children: ReactNode;
}

/**
 * Саммари шага (легаси ResultContainer): итог сборки и переход на следующий
 * шаг. Стоит в правой колонке ScreenSplit и липнет под степпером.
 */
export const FlowSummary = ({
    title = 'Итог',
    onNext,
    nextDisabled,
    hint,
    actions,
    children,
}: FlowSummaryProps) => {
    const step = useFlowStepActions(onNext);

    return (
        <SectionCard
            title={title}
            tone="complect"
            accent
            footer={
                <div className="flex w-full flex-col gap-2">
                    {hint ? (
                        <p className="text-xs text-muted-foreground">{hint}</p>
                    ) : null}
                    {actions}
                    {step.nextLabel ? (
                        <Button
                            onClick={step.goNext}
                            disabled={nextDisabled}
                            className={cn(
                                'w-full',
                                step.isComplectTone &&
                                    'bg-complect-current text-complect-current-foreground hover:bg-complect-current/90',
                            )}
                        >
                            Далее: {step.nextLabel}
                            <ArrowRight aria-hidden />
                        </Button>
                    ) : null}
                    <Button
                        variant="ghost"
                        onClick={step.goBack}
                        className="w-full"
                    >
                        <ArrowLeft aria-hidden />
                        Назад
                    </Button>
                </div>
            }
        >
            {children}
        </SectionCard>
    );
};
