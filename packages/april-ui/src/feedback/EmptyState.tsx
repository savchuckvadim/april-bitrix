'use client';

import type { ComponentType, ReactNode } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { TONE_SOFT, type Tone } from '../lib/tones';

export type EmptyStateLayout = 'screen' | 'section';

export interface EmptyStateProps {
    /** Иконка lucide-react (или любая, принимающая className). */
    icon?: ComponentType<{ className?: string }>;
    title: ReactNode;
    description?: ReactNode;
    /** Кнопки и ссылки под текстом. */
    actions?: ReactNode;
    /** Цвет значка из реестра тонов. */
    tone?: Tone;
    /**
     * `screen` — во весь экран: гейты доступа, «нет компании»;
     * `section` — внутри страницы: пустой список, экран ещё не готов.
     */
    layout?: EmptyStateLayout;
    className?: string;
}

/**
 * Пустое состояние: значок, заголовок, пояснение и что делать дальше.
 *
 * Один вид на «пусто», «нет доступа» и «скоро будет» во всех приложениях —
 * раньше каждый экран рисовал свою карточку с иконкой по центру.
 */
export const EmptyState = ({
    icon: Icon,
    title,
    description,
    actions,
    tone = 'muted',
    layout = 'section',
    className,
}: EmptyStateProps) => (
    <div
        className={cn(
            'flex items-center justify-center p-4',
            layout === 'screen' ? 'min-h-svh bg-background' : 'py-12',
            className,
        )}
    >
        <div className="flex max-w-md flex-col items-center gap-3 text-center">
            {Icon ? (
                <span
                    className={cn(
                        'flex size-12 items-center justify-center rounded-xl [&>svg]:size-6',
                        TONE_SOFT[tone],
                    )}
                >
                    <Icon aria-hidden />
                </span>
            ) : null}
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            {description ? (
                <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
            {actions ? (
                <div className="mt-2 flex flex-wrap justify-center gap-2">
                    {actions}
                </div>
            ) : null}
        </div>
    </div>
);
