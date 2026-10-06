'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { fetchRelatedDetails } from '../../model/RelatedCrmThunk';
import { getEntityDescriptor } from '../entity-descriptor';

/**
 * Запросить связи клиента, когда они реально понадобились экрану.
 *
 * Граф связей больше не грузится на каждое открытие фрейма (это 8–9
 * запросов бэка в Битрикс; см. RelatedCrmAppListener). Его запрашивает
 * потребитель в момент показа: вкладка «инфо», история, контакты, выбор
 * заявки для новой задачи. Повторов нет — thunk дедуплицирует по ключу
 * сущности, готовый ответ переживает переходы список ↔ дело.
 *
 * @param needed Потребителю граф сейчас нужен. false — хук молчит (условие
 *   живёт у вызывающего: например, «у задачи нет привязки к заявке»).
 */
export const useEnsureRelations = (needed = true): void => {
    const dispatch = useAppDispatch();
    const domain = useAppSelector(s => s.app.domain);
    const from = useAppSelector(s => s.app.bitrix.from);
    const company = useAppSelector(s => s.app.bitrix.company);
    const deal = useAppSelector(s => s.app.bitrix.deal);
    const lead = useAppSelector(s => s.app.bitrix.lead);

    const descriptor = getEntityDescriptor({ from, company, deal, lead });
    // Ключ сущности: контекст сменили на лету — запросить под новый.
    const entityKey = descriptor
        ? `${descriptor.entityType}:${descriptor.entityId}`
        : null;

    useEffect(() => {
        if (!needed || !domain || !entityKey) return;
        void dispatch(fetchRelatedDetails({ includeClosed: true }));
    }, [needed, domain, entityKey, dispatch]);
};
