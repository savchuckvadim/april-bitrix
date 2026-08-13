'use client';

import { useMemo } from 'react';
import type { ComboboxOption } from '@workspace/april-ui/fields';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
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
        () =>
            users
                .filter(user => Number(user.ID) !== currentUserId)
                .map(user => ({
                    value: String(user.ID),
                    label:
                        [user.NAME, user.LAST_NAME]
                            .filter(Boolean)
                            .join(' ')
                            .trim() || `Сотрудник ${user.ID}`,
                    hint: user.WORK_POSITION || undefined,
                })),
        [users, currentUserId],
    );
};
