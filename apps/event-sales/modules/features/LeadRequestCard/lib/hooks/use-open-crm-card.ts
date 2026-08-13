'use client';

import { useCallback } from 'react';
import {
    useOpenEntityCard,
    type RelatedEntityType,
} from '@/modules/entities/RelatedCrm';
import { useAppDispatch } from '@/modules/app/lib/hooks/redux';
import { fetchLeadRequestCard } from '../../model/LeadRequestThunk';

/**
 * Открытие карточки CRM из карточки заявки: общий слайдер (`useOpenEntityCard`)
 * плюс перечитка заявки.
 *
 * Перечитка здесь не украшение: слайдер закрывается тогда, когда менеджер уже
 * поработал в сделке — сменил стадию или ответственного. Без обновления он
 * возвращается к устаревшей карточке и жмёт кнопки по старому состоянию.
 */
export const useOpenCrmCard = () => {
    const dispatch = useAppDispatch();
    const openEntityCard = useOpenEntityCard();

    return useCallback(
        async (entityType: RelatedEntityType, entityId: number) => {
            const opened = await openEntityCard(entityType, entityId);
            if (opened) dispatch(fetchLeadRequestCard());
        },
        [dispatch, openEntityCard],
    );
};
