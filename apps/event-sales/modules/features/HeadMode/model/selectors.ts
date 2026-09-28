import { createSelector } from '@reduxjs/toolkit';
import type { BXUser } from '@workspace/bx';
import type { RootState } from '@/modules/app/model/store';
import { selectAllDepartmentUsers } from '@/modules/features/Departament/model/selectors';
import {
    DEPARTAMENT_STATE_PROP,
    DUSER_ROLE,
} from '@/modules/features/Departament/type/department-type';
import {
    ActingManagerPayload,
    AssigneeOption,
    buildActingManager,
    buildAssigneeOptions,
    resolveActingEmployeeId,
    resolveTaskResponsibleIds,
} from '../lib/head-mode.util';

/**
 * Селекторы режима руководителя. UI и сборка отчёта ничего не считают
 * сами — читают готовое отсюда: правило «за кого идёт работа» должно быть
 * одним на список дел, форму, план и отправку.
 */

const selectMe = (state: RootState): BXUser | null => state.app.bitrix.user;

const selectMyId = (state: RootState): number =>
    Number(state.app.bitrix.user?.ID ?? 0);

export const selectSubordinateIds = (state: RootState): number[] =>
    state.headMode.subordinateIds;

/** У пользователя есть подчинённые — тумблер режима ему показывается. */
export const selectIsHead = (state: RootState): boolean =>
    state.headMode.subordinateIds.length > 0;

export const selectHeadModeEnabled = (state: RootState): boolean =>
    state.headMode.enabled;

/** Режим действует: пользователь — руководитель и не выключил тумблер. */
export const selectHeadModeActive = createSelector(
    [selectIsHead, selectHeadModeEnabled],
    (isHead, enabled): boolean => isHead && enabled,
);

/** Чьи дела запрашивать в список. */
export const selectTaskResponsibleIds = createSelector(
    [selectMyId, selectSubordinateIds, selectHeadModeActive],
    (myId, subordinateIds, active): number[] =>
        resolveTaskResponsibleIds(myId, subordinateIds, active),
);

/** На кого записывается отчёт и следующее дело. */
export const selectPlanResponsible = (state: RootState): BXUser | null =>
    state.department[DEPARTAMENT_STATE_PROP.PLAN][DUSER_ROLE.RESPONSIBLE]
        .current;

/** Сотрудник, дело которого открыто; null — открыто своё дело или новое. */
export const selectTaskOwnerId = createSelector(
    [
        selectHeadModeActive,
        selectMyId,
        selectSubordinateIds,
        (state: RootState) => state.eventTask.current?.responsibleId,
    ],
    (enabled, myId, subordinateIds, responsibleId): number | null =>
        resolveActingEmployeeId({
            enabled,
            myId,
            subordinateIds,
            taskResponsibleId: Number(responsibleId) || null,
        }),
);

/** Пометка отчёта «кто отчитался за сотрудника»; undefined — обычный отчёт. */
export const selectActingManager = createSelector(
    [
        selectHeadModeActive,
        selectMe,
        selectPlanResponsible,
        selectSubordinateIds,
    ],
    (
        enabled,
        me,
        responsible,
        subordinateIds,
    ): ActingManagerPayload | undefined =>
        buildActingManager({
            enabled,
            me,
            planResponsibleId: Number(responsible?.ID ?? 0),
            subordinateIds,
        }),
);

/** Сотрудник, за которого сейчас идёт работа; null — работа за себя. */
export const selectActingEmployee = createSelector(
    [selectActingManager, selectPlanResponsible],
    (manager, responsible): BXUser | null => (manager ? responsible : null),
);

/** Кому можно записать следующее дело. */
export const selectPlanAssigneeOptions = createSelector(
    [
        selectMe,
        selectAllDepartmentUsers,
        selectSubordinateIds,
        selectTaskOwnerId,
        selectPlanResponsible,
    ],
    (me, users, subordinateIds, taskOwnerId, current): AssigneeOption[] =>
        buildAssigneeOptions({
            me,
            users,
            subordinateIds,
            isActing: taskOwnerId !== null,
            current,
        }),
);
