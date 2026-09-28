'use client';

import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { selectAllDepartmentUsers } from '@/modules/features/Departament/model/selectors';
import { selectSubordinateIds } from '../../model/selectors';
import {
    findAssignee,
    taskResponsibleName,
    userFullName,
} from '../head-mode.util';

/** Ответственный задачи так, как его отдаёт Битрикс. */
interface TaskOwnerSource {
    responsibleId?: string | number | null;
    responsible?: unknown;
}

/**
 * Чьё это дело — для подписи в списке. '' — дело своё либо человека вне
 * подчинения: подпись нужна только там, где руководитель видит чужую
 * работу.
 */
export const useTaskOwnerName = (task: TaskOwnerSource): string => {
    const myId = useAppSelector(s => Number(s.app.bitrix.user?.ID ?? 0));
    const subordinateIds = useAppSelector(selectSubordinateIds);
    const users = useAppSelector(selectAllDepartmentUsers);

    const ownerId = Number(task.responsibleId ?? 0);
    if (!ownerId || ownerId === myId) return '';
    if (!subordinateIds.includes(ownerId)) return '';
    return userFullName(
        findAssignee(ownerId, users, taskResponsibleName(task)),
    );
};
