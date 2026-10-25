'use client';

import { ExternalLink } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';

export interface EntityLinkTextProps {
    title: string;
    /** Ссылка на карточку CRM; null — обычный текст без мёртвой ссылки. */
    href: string | null;
    className?: string;
}

/**
 * Название CRM-сущности ссылкой на её карточку (новая вкладка). Ссылку
 * собирает вызывающий (`getCrmUrl` из @workspace/bitrix): нет домена — нет
 * ссылки, текст остаётся текстом.
 */
export const EntityLinkText = ({ title, href, className }: EntityLinkTextProps) => {
    if (!href) {
        return (
            <span title={title} className={cn('min-w-0 truncate', className)}>
                {title}
            </span>
        );
    }

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title={`Открыть в новой вкладке: ${title}`}
            className={cn(
                'inline-flex min-w-0 items-center gap-1 underline-offset-4 hover:underline',
                className,
            )}
        >
            <span className="min-w-0 truncate">{title}</span>
            <ExternalLink
                aria-hidden
                className="size-3.5 shrink-0 text-muted-foreground"
            />
        </a>
    );
};
