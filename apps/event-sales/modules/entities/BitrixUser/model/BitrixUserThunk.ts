import { Bitrix } from '@workspace/bitrix';
import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { selectAllDepartmentUsers } from '@/modules/features/Departament/model/selectors';
import { mapPortalUser, type RawPortalUser } from '../lib/user-view';
import { bitrixUserActions } from './BitrixUserSlice';

/**
 * Доспросить у портала сотрудников, которых нет ни в отделе, ни в справочнике.
 *
 * Спрашиваем одним `user.get` по списку id и только про незнакомых: история
 * длинная, но людей в ней единицы. Ошибка не фатальна — остаётся подпись
 * «Сотрудник N», как было раньше.
 */
export const ensureBitrixUsers =
    (userIds: Array<number | null | undefined>) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const known = state.bitrixUser.byId;
        const requested = new Set(state.bitrixUser.requestedIds);
        // Кто уже есть в структуре отдела — не спрашиваем: имя там есть.
        const departmentIds = new Set(
            selectAllDepartmentUsers(state).map(user => Number(user.ID)),
        );

        const ids = [...new Set(userIds.map(Number))].filter(
            id =>
                Number.isFinite(id) &&
                id > 0 &&
                !known[id] &&
                !requested.has(id) &&
                !departmentIds.has(id),
        );
        if (!ids.length) return;

        dispatch(bitrixUserActions.markRequested({ ids }));

        try {
            const raw = (await Bitrix.getService().user.getByIds(
                ids,
            )) as RawPortalUser[];
            const users = raw
                .map(mapPortalUser)
                .filter((user): user is NonNullable<typeof user> =>
                    Boolean(user),
                );
            if (users.length) dispatch(bitrixUserActions.setUsers({ users }));
        } catch (error) {
            console.error('ensureBitrixUsers error', ids, error);
        }
    };
