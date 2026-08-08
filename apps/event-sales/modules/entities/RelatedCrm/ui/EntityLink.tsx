'use client';

import { FC } from 'react';
import { ExternalLink } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import type { EntityDescriptor } from '../lib/entity-descriptor';
import { getEntityCardUrl } from '../lib/entity-url';

interface EntityLinkProps {
    descriptor: EntityDescriptor;
    className?: string;
}

/**
 * Название текущей сущности — ссылкой на её карточку в CRM (новая вкладка).
 * Домена нет (dev вне фрейма) — рендерится обычным текстом, без мёртвой ссылки.
 */
export const EntityLink: FC<EntityLinkProps> = ({ descriptor, className }) => {
    const domain = useAppSelector(s => s.app.domain);
    const href = getEntityCardUrl(
        domain,
        descriptor.entityType,
        descriptor.entityId,
    );

    if (!href) {
        return (
            <span className={cn('min-w-0 truncate', className)}>
                {descriptor.title}
            </span>
        );
    }

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title={`Открыть в новой вкладке: ${descriptor.title}`}
            className={cn(
                'inline-flex min-w-0 items-center gap-1 underline-offset-4 hover:underline',
                className,
            )}
        >
            <span className="min-w-0 truncate">{descriptor.title}</span>
            <ExternalLink
                aria-hidden
                className="size-3.5 shrink-0 text-muted-foreground"
            />
        </a>
    );
};
