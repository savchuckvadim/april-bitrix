import { createSelector } from '@reduxjs/toolkit';
import { selectMyDepartmentRole } from '@/modules/features/Departament/model/selectors';
import {
    selectIsHead,
    selectIsSuperUser,
} from '@/modules/features/HeadMode/model/selectors';
import { effectiveManageRole } from '../lib/join-to-main.util';

/**
 * Роль для кнопок руководителя в дублях («Присоединить сюда», «Объединить
 * карточки»): структура отдела + суперпользователь и подчинённые с бэка.
 */
export const selectDuplicatesManageRole = createSelector(
    [selectMyDepartmentRole, selectIsSuperUser, selectIsHead],
    (info, isSuperUser, hasSubordinates) =>
        effectiveManageRole(info.role, { isSuperUser, hasSubordinates }),
);
