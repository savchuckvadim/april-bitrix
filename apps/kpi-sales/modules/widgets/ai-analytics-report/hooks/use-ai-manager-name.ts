'use client';

import { useCallback } from 'react';
import { useAppSelector } from '@/modules/app';
import { financeEmployeeName } from '@/modules/entities/finance';

/** Имя менеджера по Bitrix-id из справочника структуры (department.items). */
export const useAiManagerName = () => {
    const items = useAppSelector(state => state.department.items);
    return useCallback(
        (managerId: string | null | undefined): string =>
            managerId ? financeEmployeeName(items, Number(managerId)) : '—',
        [items],
    );
};
