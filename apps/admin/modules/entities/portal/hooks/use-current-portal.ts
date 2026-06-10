'use client';

import { useAppSelector } from '@/modules/app';

/**
 * Читает текущий портал из Redux state.portal.current.
 * Заполняется layout-ом /portal/[portalId] при навигации в контекст портала.
 */
export const useCurrentPortal = () => {
    return useAppSelector((state) => state.portal.current);
};
