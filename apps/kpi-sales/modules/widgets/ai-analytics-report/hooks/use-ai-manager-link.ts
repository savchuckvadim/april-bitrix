'use client';

import { useCallback } from 'react';
import { selectIsPublic, useAppSelector } from '@/modules/app';
import {
    aiEmployeeHref,
    type AiEmployeeTab,
} from '@/modules/entities/ai-analytics';

/**
 * Ссылка на страницу сотрудника по Bitrix-id (как у RTable/Airtime), при
 * необходимости — сразу на подвкладку AI-раздела (`aiUserTab=`); на
 * публичном снимке ссылок нет — null.
 */
export const useAiManagerLink = () => {
    const isPublic = useAppSelector(selectIsPublic);
    return useCallback(
        (
            managerId: string | null | undefined,
            tab?: AiEmployeeTab,
        ): string | null =>
            !isPublic && managerId ? aiEmployeeHref(managerId, tab) : null,
        [isPublic],
    );
};
