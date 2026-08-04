'use client';

import { useAppSelector } from '@/modules/app/lib/hooks/redux';

/**
 * Читает текущий портал из Redux state.portal.current.
 * Заполняется layout-ом /portal/[portalId] при навигации в контекст портала.
 */
export const useCurrentPortal = () => {
    return useAppSelector((state) => state.portal.current);
};
