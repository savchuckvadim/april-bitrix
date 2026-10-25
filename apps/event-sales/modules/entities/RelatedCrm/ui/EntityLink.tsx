'use client';

import { FC } from 'react';
import { EntityLinkText } from '@workspace/april-ui/entity';
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
 * Вёрстка — общая с конструктором (@workspace/april-ui/entity).
 */
export const EntityLink: FC<EntityLinkProps> = ({ descriptor, className }) => {
    const domain = useAppSelector(s => s.app.domain);
    const href = getEntityCardUrl(
        domain,
        descriptor.entityType,
        descriptor.entityId,
    );

    return (
        <EntityLinkText
            title={descriptor.title}
            href={href}
            className={className}
        />
    );
};
