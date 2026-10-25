'use client';

import { FC } from 'react';
import { EntityTitle } from '@workspace/april-ui/entity';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    getEntityCardUrl,
    useCurrentRelations,
} from '@/modules/entities/RelatedCrm';

/**
 * Кто открыт: название-ссылка на карточку CRM, под ним — тип сущности, справа
 * ответственный. Вёрстка — общая с конструктором (@workspace/april-ui/entity).
 */
interface EntityIdentityProps {
    /**
     * `lg` — крупное название для высокого хедера широких экранов
     * (todo2508 №6); `md` — прежний размер.
     */
    size?: 'md' | 'lg';
}

export const EntityIdentity: FC<EntityIdentityProps> = ({ size = 'md' }) => {
    const { descriptor, details } = useCurrentRelations();
    const domain = useAppSelector(s => s.app.domain);
    if (!descriptor) return null;

    return (
        <EntityTitle
            title={descriptor.title}
            href={getEntityCardUrl(
                domain,
                descriptor.entityType,
                descriptor.entityId,
            )}
            kindLabel={descriptor.kindLabel}
            meta={details?.responsible?.name}
            size={size}
        />
    );
};
