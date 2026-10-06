'use client';

import { FC } from 'react';
import { HintTooltip } from '@workspace/april-ui';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import type {
    QuickOutcomeButtonState,
    QuickOutcomeKind,
} from '../lib/quick-outcome';
import { QUICK_OUTCOME_TONE_CLASS } from './quick-outcome-tone';

interface QuickOutcomeActionProps {
    button: QuickOutcomeButtonState;
    label: string;
    size?: 'sm' | 'default';
    /** Вид кнопки задаёт место, где она стоит (шапка, пустой список). */
    className?: string;
    /** Общая блокировка всех кнопок итога (идёт отправка) и её причина. */
    disabled: boolean;
    hint?: string;
    onOpen: (kind: QuickOutcomeKind) => void;
}

/**
 * Одна кнопка итога. Недоступная по правилу (продажа без компании) — серая,
 * с подсказкой, почему: менеджер видит, что кнопка есть и что сделать,
 * чтобы она заработала.
 */
export const QuickOutcomeAction: FC<QuickOutcomeActionProps> = ({
    button,
    label,
    size,
    className,
    disabled,
    hint,
    onOpen,
}) => {
    const blockedHint = button.blockedHint;
    const element = (
        <Button
            size={size}
            variant="outline"
            disabled={disabled || Boolean(blockedHint)}
            title={blockedHint ? undefined : hint}
            className={cn(
                className,
                blockedHint
                    ? 'text-muted-foreground'
                    : QUICK_OUTCOME_TONE_CLASS[button.kind],
            )}
            onClick={() => onOpen(button.kind)}
        >
            {label}
        </Button>
    );
    if (!blockedHint) return element;

    // У неактивной кнопки событий наведения нет — подсказку держит обёртка.
    return (
        <HintTooltip title={blockedHint}>
            <span tabIndex={0} className="inline-flex cursor-not-allowed">
                {element}
            </span>
        </HintTooltip>
    );
};
