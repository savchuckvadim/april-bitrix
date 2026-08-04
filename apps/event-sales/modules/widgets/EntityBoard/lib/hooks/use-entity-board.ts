'use client';

import { useMemo } from 'react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { useRelatedCrm, type RelatedCrmData } from '@/modules/entities/RelatedCrm';
import { getEntityDescriptor, EntityDescriptor } from '../entity-descriptor';

export interface EntityBoardData extends RelatedCrmData {
    descriptor: EntityDescriptor | null;
}

/**
 * Сборка экрана: кто в фокусе + его связи.
 *
 * Виджет только соединяет две вещи — контекст встройки и сущность связей.
 * Логика запроса живёт в `entities/RelatedCrm`, потому что теми же данными
 * пользуется панель дублей.
 */
export const useEntityBoard = (): EntityBoardData => {
    const domain = useAppSelector(s => s.app.domain);
    const from = useAppSelector(s => s.app.bitrix.from);
    const company = useAppSelector(s => s.app.bitrix.company);
    const deal = useAppSelector(s => s.app.bitrix.deal);
    const lead = useAppSelector(s => s.app.bitrix.lead);

    const descriptor = useMemo(
        () => getEntityDescriptor({ from, company, deal, lead }),
        [from, company, deal, lead],
    );

    const related = useRelatedCrm({
        domain,
        entityType: descriptor?.entityType ?? null,
        entityId: descriptor?.entityId ?? null,
    });

    return { descriptor, ...related };
};
