import type { RootState } from '@/modules/app/model/store';
import { selectAllDepartmentUsers } from '@/modules/features/Departament/model/selectors';
import {
    type ActingManagerPayload,
    userFullName,
} from '@/modules/features/HeadMode/lib/head-mode.util';
import { selectPlanResponsible } from '@/modules/features/HeadMode/model/selectors';
import { buildQuickOutcomeSender } from '../lib/quick-outcome';

/**
 * Пометка отчёта «кто записал итог за ответственного сделки».
 *
 * Пока идёт быстрый итог, отчёт записывается на ответственного сделки
 * (он стоит ответственным плана), а нажавший кнопку уезжает этой
 * пометкой — тем же полем, что у режима руководителя. Итога нет или он
 * записывается на себя — undefined.
 */
export const selectQuickOutcomeSender = (
    state: RootState,
): ActingManagerPayload | undefined =>
    buildQuickOutcomeSender({
        isActive: state.quickOutcome.kind !== null,
        me: state.app.bitrix.user,
        ownerId: Number(selectPlanResponsible(state)?.ID ?? 0),
    });

/** Итог записывается на другого сотрудника, а не на нажавшего кнопку. */
export const selectIsOutcomeForOther = (state: RootState): boolean => {
    const ownerId = state.quickOutcome.ownerId;
    return Boolean(ownerId) && ownerId !== Number(state.app.bitrix.user?.ID);
};

/**
 * Имя того, на кого записывается итог; '' — имя неизвестно.
 *
 * Сотрудник отдела продаж есть в загруженном отделе; остальных
 * доспрашивает справочник сотрудников портала (useEnsureUsers). Пустая
 * строка, а не «Сотрудник 369»: в окне лучше сказать «на ответственного
 * сделки» без имени, чем показать номер.
 */
export const selectQuickOutcomeOwnerName = (state: RootState): string => {
    const ownerId = state.quickOutcome.ownerId;
    if (!ownerId) return '';
    const inDepartment = selectAllDepartmentUsers(state).find(
        user => Number(user.ID) === ownerId,
    );
    if (inDepartment) return userFullName(inDepartment);
    return state.bitrixUser.byId[ownerId]?.name ?? '';
};
