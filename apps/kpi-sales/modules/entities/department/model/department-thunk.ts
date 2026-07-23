import { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { APP_DEP } from '@/modules/app/model/AppSlice';
import { logClient } from '@/modules/app/lib/helper/logClient';
import { DepartmentHelper } from '../lib/api/department-helper';
import { normalizeSalesDepartments } from '../lib/normalize';
import { computeDepartmentScope } from '../lib/scope.util';
import { isSuperUser } from '../lib/super-user';
import { departmentActions } from './department-slice';
import type { DepartmentStructureRequest } from './index';

const departmentHelper = new DepartmentHelper();

/**
 * Загрузка структуры отделов продаж (моно и мульти — единый ответ бэка).
 * Дальнейшая цепочка (сохранённый фильтр → отчёт) — через listeners,
 * реагирующие на departmentActions.setStructure.
 */
export const getDepartmentStructure =
    () => async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const { app, department } = state;
        const user = app.bitrix.user;
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
                isSuperUser(user),
                user,
            );

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
