'use client';

import { useMemo } from 'react';
import {
    buildRelationsBar,
    MAX_RELATION_BARS,
    type RelationsBarMode,
    type RelationsBarView,
} from '../relations-bar';
import { useCurrentRelations } from './use-current-relations';

/**
 * Связи клиента для шапки: главная полоска и миниатюры остальных.
 *
 * Данные те же, что у полноэкранной карточки (общий `useCurrentRelations`),
 * поэтому лишнего запроса шапка не делает — ответ переиспользуется.
 */
export const useRelationsBar = (
    max = MAX_RELATION_BARS,
    mode: RelationsBarMode = 'all',
): RelationsBarView & { isLoading: boolean } => {
    const { details, descriptor, status } = useCurrentRelations();

    const view = useMemo(
        () =>
            buildRelationsBar({
                deals: details?.deals,
                leads: details?.leads,
                currentDealId: descriptor?.currentDealId ?? null,
                max,
                mode,
            }),
        [details?.deals, details?.leads, descriptor?.currentDealId, max, mode],
    );

    return { ...view, isLoading: status === 'loading' };
};
