'use client';

import { useCallback } from 'react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { userDisplayName } from '@/modules/entities/BitrixUser/lib/user-view';
import { selectAllDepartmentUsers } from '@/modules/features/Departament/model/selectors';

export interface HistoryResponsible {
    name: string;
    isCurrentUser: boolean;
}

/**
 * Имя ответственного записи истории.
 *
 * Сначала структура отдела продаж — она уже загружена. Кого там нет (а это
 * любой, кто работает вне ОП: руководитель, админ, сотрудник другого
 * подразделения), берём из справочника портала, который доспрашивает
 * `ensureBitrixUsers`. Раньше второго шага не было, и такие записи
 * подписывались «Сотрудник 447» — в том числе для самого же пользователя.
 */
export const useHistoryResponsible = (): ((
    responsibleId: number | null,
) => HistoryResponsible | null) => {
    const users = useAppSelector(selectAllDepartmentUsers);
    const directory = useAppSelector(s => s.bitrixUser.byId);
    const currentUserId = useAppSelector(s =>
        Number(s.app.bitrix.user?.ID ?? 0),
    );

    return useCallback(
        (responsibleId: number | null) => {
            if (!responsibleId) return null;

            const fromDepartment = users.find(
                item => Number(item.ID) === responsibleId,
            );
            const name = fromDepartment
                ? userDisplayName(fromDepartment, responsibleId)
                : (directory[responsibleId]?.name ??
                  userDisplayName(null, responsibleId));

            return { name, isCurrentUser: responsibleId === currentUserId };
        },
        [users, directory, currentUserId],
    );
};
