import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { BXUser } from '@workspace/bx';
import { getDomainConfig } from '@/modules/app/consts/domain-config';
import { getClientContext } from '@/modules/app/lib/utills/app-state-util';
import { eventPlanActions } from '@/modules/entities/EventPlan';
import { eventReportActions } from '@/modules/entities/EventReport';
import { departmentActions } from './DepartmentSlice';
import { DepartmentHelper } from '../lib/api/department-helper';
import {
    getModeIdByUser,
    getSavedDepartmentMode,
    saveDepartmentMode,
} from '../lib/department-mode-util';
import {
    DEPARTAMENT_STATE_PROP,
    DUSER_ROLE,
    DepartmentStructureState,
} from '../type/department-type';

const departmentHelper = new DepartmentHelper();

/**
 * Пользователи отдела продаж портала.
 * Замена legacy PHP full/department (+localStorage-кэш — теперь Redis на бэке).
 */
export const getDepartment =
    (domain: string, currentUser: BXUser | null) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        try {
            const response = await departmentHelper.getSalesDepartment(domain);
            const data = response?.department;
            const users = (data?.allUsers ?? null) as unknown as
                | BXUser[]
                | null;
            const { bossId } = getState().app.config;

            // Структура отделов (general/children/parents c UF_HEAD) — сырьё
            // для ролей: раньше выбрасывалась, и роли считать было не из чего.
            const structure = data
                ? {
                      general: (data.generalDepartment ??
                          []) as unknown as DepartmentStructureState['general'],
                      children: (data.childrenDepartments ??
                          []) as unknown as DepartmentStructureState['children'],
                      parents: (data.parentDepartments ??
                          []) as unknown as DepartmentStructureState['parents'],
                  }
                : null;

            dispatch(
                departmentActions.setFetchedDepartament({
                    department: users,
                    currentUser,
                    bossId,
                    structure,
                }),
            );
        } catch (error) {
            console.error('getDepartment error', error);
        }
    };

/**
 * Начальный режим отдела: на доменах с переключателем — из localStorage
 * или по должности пользователя; иначе всегда ОП (sales).
 */
export const setDepartmentMode =
    (user: BXUser | null, domain: string) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const { withDepartmentModeToggle } = getDomainConfig(domain, user);

        let depModeId = 0;
        if (withDepartmentModeToggle) {
            const saved = getSavedDepartmentMode();
            depModeId = saved ? saved.id : getModeIdByUser(user);
        }

        dispatch(departmentActions.setMode({ depModeId }));
        // На буте сущности ещё не отрезолвлены → context='unknown' (только
        // звонок); реальный контекст доедет листенером плана на setAppData.
        dispatch(
            eventPlanActions.clean({
                isTmc: depModeId == 1,
                context: getClientContext(getState()),
            }),
        );
    };

/** Переключение режима ОП/ТМЦ пользователем (тумблер). */
export const switchDepartmentMode =
    (depModeId: number) => async (dispatch: AppDispatch, getState: AppGetState) => {
        dispatch(departmentActions.setMode({ depModeId }));

        const mode = getState().department[DEPARTAMENT_STATE_PROP.MODE].current;
        if (mode) saveDepartmentMode(mode);

        const isTmc = depModeId == 1;
        dispatch(
            eventPlanActions.clean({
                isTmc,
                context: getClientContext(getState()),
            }),
        );
        dispatch(eventReportActions.setMode({ depModeId }));
    };

/** Выбор ответственного/постановщика для плана или отчёта. */
export const setCurrentUser =
    (
        from: DEPARTAMENT_STATE_PROP.PLAN | DEPARTAMENT_STATE_PROP.REPORT,
        role: DUSER_ROLE,
        userId: number,
    ) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const users =
            getState().department[DEPARTAMENT_STATE_PROP.DEPARTAMENT][
                DUSER_ROLE.RESPONSIBLE
            ].items;
        const current = users.find(user => user.ID == userId);
        if (current) {
            dispatch(departmentActions.setCurrentUser({ from, role, value: current }));
        }
    };
