'use client';

import { useMemo } from 'react';
import { useProviderImages } from '../../../lib/hooks';
import { providerImageErrorMessage, isProviderImagesUnavailable } from '../../../lib/provider-image-error.util';
import { buildProviderImageSlots, hasNoProviderImages } from '../../../lib/provider-image-slots.util';
import { PROVIDER_IMAGES_TEXT } from '../../../model';

export type ProviderImagesSectionStatus = 'loading' | 'unavailable' | 'error' | 'ready';

/**
 * Состояние раздела: загрузка списка, «раздел пока недоступен» (бэк отвечает
 * 500 до миграции), ошибка с текстом бэка и готовые слоты по ролям.
 */
export function useProviderImagesSection(rqId: number) {
    const query = useProviderImages(rqId);
    const slots = useMemo(() => buildProviderImageSlots(query.data), [query.data]);

    let status: ProviderImagesSectionStatus = 'ready';
    if (query.isError) {
        status = isProviderImagesUnavailable(query.error) ? 'unavailable' : 'error';
    } else if (query.isLoading) {
        status = 'loading';
    }

    return {
        status,
        slots,
        isEmpty: status === 'ready' && hasNoProviderImages(slots),
        errorMessage: providerImageErrorMessage(query.error, PROVIDER_IMAGES_TEXT.loadError),
        retry: () => void query.refetch(),
    };
}
