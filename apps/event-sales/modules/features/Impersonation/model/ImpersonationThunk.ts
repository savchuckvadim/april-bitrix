import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { switchAppUser } from '@/modules/app/model/thunk/AppUserSwitchThunk';
import { selectAllDepartmentUsers } from '@/modules/features/Departament/model/selectors';
import { canImpersonate } from '../lib/impersonation.util';
import { impersonationActions } from './ImpersonationSlice';

/**
 * Включить «работать как»: приложение перезапускается под сотрудником.
 * Только суперпользователю (флаг с бэка); сотрудник — из отдела продаж.
 * false — режим не включён (нет прав, уже включён, сотрудник не найден).
 */
export const startImpersonation =
    (userId: number) =>
    async (dispatch: AppDispatch, getState: AppGetState): Promise<boolean> => {
        const state = getState();
        const realUser = state.app.bitrix.user;
        if (
            !realUser ||
            !canImpersonate({
                isSuperUser: state.headMode.isSuperUser,
                session: state.impersonation,
                myId: Number(realUser.ID),
                targetId: userId,
            })
        ) {
            return false;
        }
        const target = selectAllDepartmentUsers(state).find(
            user => Number(user.ID) === userId,
        );
        if (!target) return false;

        await dispatch(
            switchAppUser(impersonationActions.started({ realUser, target })),
        );
        return true;
    };

/** Вернуться к себе: приложение перезапускается под владельцем фрейма. */
export const stopImpersonation =
    () => async (dispatch: AppDispatch, getState: AppGetState) => {
        if (!getState().impersonation.target) return;
        await dispatch(switchAppUser(impersonationActions.stopped()));
    };
