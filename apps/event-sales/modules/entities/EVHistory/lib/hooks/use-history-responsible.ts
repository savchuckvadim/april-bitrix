'use client';

import { useCallback } from 'react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { selectAllDepartmentUsers } from '@/modules/features/Departament/model/selectors';

export interface HistoryResponsible {
    name: string;
    isCurrentUser: boolean;
}

/**
 * Имя ответственного записи истории из уже загруженного отдела — без единого
 * нового запроса. Вне отдела — честный «Сотрудник N» (добор user.get заведём,
 * только если это реально понадобится живым пользователям).
 */
export const useHistoryResponsible = (): ((
    responsibleId: number | null,
) => HistoryResponsible | null) => {
    const users = useAppSelector(selectAllDepartmentUsers);
    const currentUserId = useAppSelector(s => Number(s.app.bitrix.user?.ID ?? 0));

    return useCallback(
        (responsibleId: number | null) => {
            if (!responsibleId) return null;
            const user = users.find(item => Number(item.ID) === responsibleId);
            const name = user
                ? [user.NAME, user.LAST_NAME].filter(Boolean).join(' ')
                : `Сотрудник ${responsibleId}`;
            return { name, isCurrentUser: responsibleId === currentUserId };
        },
        [users, currentUserId],
    );
};
