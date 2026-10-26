'use client';

import { useMemo } from 'react';
import type { ComboboxOption } from '@workspace/april-ui/fields';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { toUserOptions } from '@/modules/features/Departament/lib/user-options';
import { selectAllDepartmentUsers } from '@/modules/features/Departament/model/selectors';

/**
 * Кому можно передать заявку: сотрудники отдела продаж, кроме себя.
 *
 * Структура отдела уже загружена на буте — отдельная ручка на бэке для этого
 * не нужна. Себя из списка убираем: передать заявку самому себе значит просто
 * не передавать.
 */
export const useTransferCandidates = (): ComboboxOption[] => {
    const users = useAppSelector(selectAllDepartmentUsers);
    const currentUserId = useAppSelector(s =>
        Number(s.app.bitrix.user?.ID ?? 0),
    );

    return useMemo(
        () => toUserOptions(users, [currentUserId]),
        [users, currentUserId],
    );
};
