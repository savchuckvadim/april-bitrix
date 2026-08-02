'use client';

import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { CollapsibleTrigger } from '@workspace/ui/components/collapsible';
import { cn } from '@workspace/ui/lib/utils';
import { TONE_TEXT, type Tone } from '../../lib/tones';

export interface SectionCardHeaderProps {
    title?: ReactNode;
    description?: ReactNode;
    /**
     * Правый слот: свитчи, бэйджи, кнопки. Живёт СНАРУЖИ кнопки-раскрывашки —
     * вложенные интерактивные элементы ломают и клик, и доступность.
     */
    actions?: ReactNode;
    tone: Tone;
    collapsible: boolean;
    compact: boolean;
    className?: string;
}

/** Шапка секции: заголовок (он же раскрывашка) + слот действий справа. */
export const SectionCardHeader = ({
    title,
    description,
    actions,
    tone,
    collapsible,
    compact,
    className,
}: SectionCardHeaderProps) => {
    const heading = (
        <div className="min-w-0 text-left">
            {title && (
                <CardTitle
                    className={cn(
                        compact ? 'text-sm' : 'text-base',
                        tone !== 'neutral' && TONE_TEXT[tone],
                    )}
                >
                    {title}
                </CardTitle>
            )}
            {description && (
                <CardDescription className="mt-1">{description}</CardDescription>
            )}
        </div>
    );

    return (
        <CardHeader
            className={cn(
                'flex flex-row items-center justify-between gap-2 space-y-0',
                compact && 'px-3',
                className,
            )}
        >
            {collapsible ? (
                <CollapsibleTrigger className="group flex min-w-0 flex-1 cursor-pointer items-center gap-2">
                    {heading}
                    <ChevronDown
                        aria-hidden
                        className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180 motion-reduce:transition-none"
                    />
                </CollapsibleTrigger>
            ) : (
                heading
            )}

            {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </CardHeader>
    );
};
