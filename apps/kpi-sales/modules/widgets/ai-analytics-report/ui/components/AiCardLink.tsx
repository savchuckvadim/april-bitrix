'use client';

import { ExternalLink } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';

interface AiCardLinkProps {
    href: string;
    label: string;
    /** Подсказка при наведении. */
    title?: string;
    className?: string;
}

/** Ссылка на карточку разбора звонка в Битрикс24 — открывается в новой вкладке. */
export const AiCardLink = ({
    href,
    label,
    title,
    className,
}: AiCardLinkProps) => (
    <a
        href={href}
        target="_blank"
        rel="noreferrer"
        title={title}
        className={cn(
            'inline-flex items-center gap-1 text-primary underline-offset-2 hover:underline',
            className,
        )}
    >
        <ExternalLink className="h-3 w-3" />
        {label}
    </a>
);
