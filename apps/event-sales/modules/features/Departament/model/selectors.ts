import { createSelector } from '@reduxjs/toolkit';
import type { BXUser } from '@workspace/bx';
import type { RootState } from '@/modules/app/model/store';
import {
    DepartmentRoleInfo,
    resolveDepartmentRole,
} from '../lib/department-role-util';
import { DEPARTAMENT_STATE_PROP, DUSER_ROLE } from '../type/department-type';

/**
 * Селекторы ролей отдела. UI не считает ничего сам — только читает готовое
 * (правило front-refactor: логика в хуках/селекторах, компонент = вёрстка).
 */

export const selectDepartmentStructure = (state: RootState) =>
    state.department[DEPARTAMENT_STATE_PROP.STRUCTURE];

export const selectAllDepartmentUsers = (state: RootState): BXUser[] =>
    state.department[DEPARTAMENT_STATE_PROP.DEPARTAMENT][DUSER_ROLE.RESPONSIBLE]
        .items;

const selectCurrentUserId = (state: RootState): number =>
    Number(state.app.bitrix.user?.ID ?? 0);

const selectBossId = (state: RootState): number =>
    Number(state.app.config?.bossId ?? 0);

export const selectMyDepartmentRole = createSelector(
    [
        selectCurrentUserId,
        selectBossId,
        selectDepartmentStructure,
        selectAllDepartmentUsers,
    ],
    (userId, bossId, structure, allUsers): DepartmentRoleInfo =>
        resolveDepartmentRole({ userId, bossId, structure, allUsers }),
);

/** Руководитель текущего пользователя; ищем и среди родительских отделов. */
export const selectMyHead = createSelector(
    [selectMyDepartmentRole, selectAllDepartmentUsers, selectDepartmentStructure],
    (roleInfo, allUsers, structure): BXUser | null => {
        if (!roleInfo.headId) return null;
        const fromUsers = allUsers.find(
            user => Number(user.ID) === roleInfo.headId,
        );
        if (fromUsers) return fromUsers;
        for (const dep of structure.parents) {
            const found = dep.USERS?.find(
                user => Number(user.ID) === roleInfo.headId,
            );
            if (found) return found;
        }
        return null;
    },
);

export const selectMyColleagues = createSelector(
    [selectMyDepartmentRole, selectAllDepartmentUsers],
    (roleInfo, allUsers): BXUser[] =>
        allUsers.filter(user =>
            roleInfo.colleagueIds.includes(Number(user.ID)),
        ),
);
