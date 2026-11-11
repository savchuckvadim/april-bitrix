'use client';

import { useCallback } from 'react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { openPortalCard } from '@/modules/app/lib/utills/open-portal-card';
import { getEntityCardPath, getEntityCardUrl } from '../entity-url';
import type { RelatedEntityType } from '../../model';

/**
 * Открытие карточки CRM из встройки — без побочных эффектов: слайдер поверх
 * портала, запасной путь — новая вкладка (см. {@link openPortalCard}).
 *
 * Возвращает `true`, если карточку удалось открыть: вызывающему бывает важно
 * знать, случился переход или нет.
 */
export const useOpenEntityCard = () => {
    const domain = useAppSelector(state => state.app.domain);

    return useCallback(
        (entityType: RelatedEntityType, entityId: number): Promise<boolean> =>
            openPortalCard(
                getEntityCardPath(entityType, entityId),
                getEntityCardUrl(domain, entityType, entityId),
            ),
        [domain],
    );
};
