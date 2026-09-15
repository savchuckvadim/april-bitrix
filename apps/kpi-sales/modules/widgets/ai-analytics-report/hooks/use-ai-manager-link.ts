'use client';

import { useCallback } from 'react';
import { selectIsPublic, useAppSelector } from '@/modules/app';

/**
 * Ссылка на отчёт сотрудника по Bitrix-id (как у RTable/Airtime);
 * на публичном снимке ссылок нет — null.
 */
export const useAiManagerLink = () => {
    const isPublic = useAppSelector(selectIsPublic);
    return useCallback(
        (managerId: string | null | undefined): string | null =>
            !isPublic && managerId ? `/report/user?userId=${managerId}` : null,
        [isPublic],
    );
};
