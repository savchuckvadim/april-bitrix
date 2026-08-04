'use client';

import { useMemo } from 'react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { getEntityDescriptor, EntityDescriptor } from '../entity-descriptor';
import { useRelatedCrm, type RelatedCrmData } from './use-related-crm';

export interface CurrentRelations extends RelatedCrmData {
    descriptor: EntityDescriptor | null;
}

/**
 * Связи клиента, который сейчас в фокусе встройки.
 *
 * Одна точка входа для всех экранов: и полноэкранная карточка, и список дел
 * спрашивают одно и то же. `enabled` нужен, чтобы список не ходил за связями,
 * когда рисует таблицу — миниатюры там не показываются, и запрос был бы
 * потрачен впустую.
 */
export const useCurrentRelations = (enabled = true): CurrentRelations => {
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
        enabled,
    });

    return { descriptor, ...related };
};
