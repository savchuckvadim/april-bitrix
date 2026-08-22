'use client';

import { FC } from 'react';
import { Check } from 'lucide-react';
import { HintTooltip } from '@workspace/april-ui';
import { cn } from '@workspace/ui/lib/utils';
import { usePresentationDone } from '../../lib/hooks/use-presentation-done';

/**
 * Отметка «презентация проведена» микро-чипом в пульте отчёта.
 *
 * Показывается там, где кнопки в карточке комментария НЕТ (нерезультативное
 * событие, ТМЦ, лид): состояние одно на двоих, но два одинаковых контрола в
 * одной колонке читались бы как дубль. Тултип объясняет, откуда взялась
 * отметка и что будет, если её снять (тексты — в presentation-hint).
 */
export const PresentationDoneChip: FC = () => {
    const { isDone, hint, toggle } = usePresentationDone();

    return (
        <HintTooltip title={hint.title} lines={hint.lines}>
            <button
                type="button"
                onClick={toggle}
                aria-pressed={isDone}
                className={cn(
                    'inline-flex cursor-pointer items-center gap-1 rounded-full border px-2 py-0.5 text-[0.6875rem] whitespace-nowrap',
                    isDone
                        ? 'border-transparent bg-event-pres/20 font-semibold text-[color:color-mix(in_oklab,var(--event-pres),var(--foreground)_var(--tone-soft-mix-strong))]'
                        : 'border-border text-muted-foreground hover:text-foreground',
                )}
            >
                {isDone && <Check aria-hidden className="size-3" />}
                презентация проведена
            </button>
        </HintTooltip>
    );
};
