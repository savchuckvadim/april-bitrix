'use client';

import { BookOpen } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { HintTooltip } from '@workspace/april-ui';
import {
    AI_THEORY_LINK_LABEL,
    aiTheoryUrl,
    type AiTheoryTopic,
} from '../../lib/ai-theory-link';

export type AiTheoryLinkVariant = 'icon' | 'text';

interface AiTheoryLinkProps {
    topic: AiTheoryTopic;
    label?: string;
    /** icon — одна иконка с подсказкой (шапки карточек); text — иконка и подпись. */
    variant?: AiTheoryLinkVariant;
    className?: string;
}

/**
 * Ссылка на страницу теории (публичный сайт, без входа) — открывается в
 * новой вкладке. Маленькая и приглушённая: помощь, а не действие.
 */
export const AiTheoryLink = ({
    topic,
    label = AI_THEORY_LINK_LABEL,
    variant = 'text',
    className,
}: AiTheoryLinkProps) => {
    const anchor = (
        <a
            href={aiTheoryUrl(topic)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={variant === 'icon' ? label : undefined}
            className={cn(
                'inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline',
                variant === 'icon' && 'size-6 justify-center rounded-md hover:bg-muted hover:no-underline',
                className,
            )}
        >
            <BookOpen className="h-3.5 w-3.5" />
            {variant === 'text' && <span>{label}</span>}
        </a>
    );

    return variant === 'icon' ? (
        <HintTooltip title={label}>{anchor}</HintTooltip>
    ) : (
        anchor
    );
};
