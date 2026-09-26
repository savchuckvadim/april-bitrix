import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { APP_DEP, appActions } from '@/modules/app/model/AppSlice';
import { logClient } from '@/modules/app/lib/helper/logClient';
import { DepartmentHelper } from '../lib/api/department-helper';
import { normalizeSalesDepartments } from '../lib/utils/normalize';
import { computeDepartmentScope } from '../lib/utils/scope.util';
import { departmentActions } from './department-slice';
import type { DepartmentStructureRequest } from './index';

const departmentHelper = new DepartmentHelper();

/**
 * Загрузка структуры отделов продаж (моно и мульти — единый ответ бэка).
 * Дальнейшая цепочка (сохранённый фильтр → отчёт) — через listeners,
 * реагирующие на departmentActions.setStructure.
 *
 * Суперпользователь вендора — флаг бэка currentUser.isSuperUser (env
 * BX_SUPER_USER_IDS; бэк сам отдаёт ему visibility 'all'). Флаг РЕАЛЬНОГО
 * пользователя пишется в app только из структуры без viewAs (в viewAs
 * пришла роль просматриваемого) и ДО setStructure: listener-цепочки
 * читают права сразу после неё. При ошибке загрузки флаг не трогаем.
 */
export const getDepartmentStructure =
    () => async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const { app, department } = state;
        // Режим «Смотреть как…»: структура и периметр запрашиваются от
        // имени просматриваемого пользователя — роль считает бэк.
        const isViewAs = app.viewAs.user !== null;
        const user = app.viewAs.user ?? app.bitrix.user;
        const domain = app.domain;

        if (!user || !domain || department.status === 'loading') {
            return;
        }
        dispatch(departmentActions.setLoading());

        try {
            const structure = await departmentHelper.getStructure({
                domain,
                department: APP_DEP.SALES,
                userId: Number(user.ID),
            } as DepartmentStructureRequest);

            const departments = normalizeSalesDepartments(structure);
            const scope = computeDepartmentScope(
                departments,
                structure.currentUser,
                user,
            );

            if (!isViewAs) {
                dispatch(
                    appActions.setRealSuperUser(
                        structure.currentUser.isSuperUser === true,
                    ),
                );
            }

            dispatch(
                departmentActions.setStructure({
                    isMulti: structure.isMultiple,
                    multipleTag: structure.multipleTag ?? null,
                    departments,
                    currentUser: structure.currentUser,
                    visibleUsers: scope.users,
                    visibleGroups: scope.groups,
                    isHeadManager: scope.isHeadManager,
                    defaultSelected: scope.defaultSelected,
                }),
            );
        } catch (error) {
            dispatch(departmentActions.setError());
            logClient(
                {
                    title: 'department structure',
                    level: 'error',
                    context: 'getDepartmentStructure',
                    message: 'Не удалось загрузить структуру отделов',
                    domain,
                    userId: user.ID,
                },
                { error: error instanceof Error ? error.message : error },
            );
        }
    };
