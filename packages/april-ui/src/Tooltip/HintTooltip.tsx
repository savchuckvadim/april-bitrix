'use client';

import type { ReactNode } from 'react';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { cn } from '@workspace/ui/lib/utils';

export interface HintTooltipProps {
    /** Первая строка — что это; выделена. */
    title?: ReactNode;
    /** Абзацы объяснения: почему так и что делать. */
    lines?: ReactNode[];
    side?: 'top' | 'right' | 'bottom' | 'left';
    align?: 'start' | 'center' | 'end';
    className?: string;
    children: ReactNode;
}

/**
 * Тултип-объяснение: заголовок и несколько абзацев под ним.
 *
 * Форма повторялась в каждом приложении руками — заголовок `font-medium`,
 * под ним строки приглушённым цветом, ширина ограничена. Отличались только
 * тексты, зато разъезжались ширина и цвет второстепенных строк.
 *
 * Тексты сюда приходят готовыми: подсказка — это ДАННЫЕ (у события своя, у
 * поля своя), и собираться они должны в lib рядом с правилом, которое
 * объясняют, а не в вёрстке.
 */
export const HintTooltip = ({
    title,
    lines = [],
    side = 'top',
    align = 'start',
    className,
    children,
}: HintTooltipProps) => (
    <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
            side={side}
            align={align}
            className={cn('max-w-80', className)}
        >
            {title && <p className="font-medium">{title}</p>}
            {lines.map((line, index) => (
                <p
                    key={typeof line === 'string' ? line : index}
                    className="text-primary-foreground/80"
                >
                    {line}
                </p>
            ))}
        </TooltipContent>
    </Tooltip>
);
