'use client';

import type { ComponentType, ReactNode } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { TONE_BORDER, TONE_SOFT, type Tone } from '../lib/tones';

export interface ActionTileProps {
    /** Иконка lucide-react (или любая, принимающая className). */
    icon?: ComponentType<{ className?: string }>;
    title: ReactNode;
    description?: ReactNode;
    /** Пометка в правом верхнем углу: «Скоро», счётчик, статус. */
    badge?: ReactNode;
    /** Цвет значка и рамки выбранной плитки. */
    tone?: Tone;
    /** Выбранная плитка в группе-выборе. */
    selected?: boolean;
    disabled?: boolean;
    onClick?: () => void;
    className?: string;
}

/**
 * Плитка-действие: крупная кнопка с иконкой, заголовком и пояснением.
 *
 * Для экранов, где пользователь выбирает, куда идти дальше (старт, выбор
 * документа, выбор из нескольких вариантов), — там обычная кнопка теряет
 * пояснение, а карточка не похожа на нажимаемое.
 */
export const ActionTile = ({
    icon: Icon,
    title,
    description,
    badge,
    tone = 'primary',
    selected = false,
    disabled = false,
    onClick,
    className,
}: ActionTileProps) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-pressed={selected || undefined}
        className={cn(
            'group relative flex h-full w-full cursor-pointer flex-col items-start gap-3 rounded-xl border bg-card p-5 text-left text-card-foreground shadow-xs transition',
            'hover:border-foreground/20 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none disabled:hover:border-border',
            selected && cn('border-2 shadow-md', TONE_BORDER[tone]),
            className,
        )}
    >
        {badge ? (
            <span className="absolute top-3 right-3 text-xs">{badge}</span>
        ) : null}
        {Icon ? (
            <span
                className={cn(
                    'flex size-10 items-center justify-center rounded-lg [&>svg]:size-5',
                    TONE_SOFT[tone],
                )}
            >
                <Icon aria-hidden />
            </span>
        ) : null}
        <span className="text-base font-semibold">{title}</span>
        {description ? (
            <span className="text-sm text-muted-foreground">{description}</span>
        ) : null}
    </button>
);
