import type { RootState } from '../../model/store';
import {
    DEPARTAMENT_STATE_PROP,
    DUSER_ROLE,
} from '@/modules/features/Departament/type/department-type';

/**
 * ЧЬЯ СЕЙЧАС РАБОТА: сотрудник, за которого отчитывается руководитель, а
 * вне режима руководителя — сам пользователь.
 *
 * Правило «своей сделки» (автовыбор главной сделки, подсказки о чужой
 * открытой сделке) обязано считаться от того, на кого записывается отчёт.
 * Иначе руководителю, открывшему дело сотрудника, все сделки этого
 * сотрудника показались бы чужими.
 */
export const selectWorkingUserId = (state: RootState): number | null => {
    const myId = Number(state.app.bitrix.user?.ID) || null;
    const { enabled, subordinateIds } = state.headMode;
    if (!enabled || !subordinateIds.length) return myId;

    const responsibleId =
        Number(
            state.department[DEPARTAMENT_STATE_PROP.PLAN][
                DUSER_ROLE.RESPONSIBLE
            ].current?.ID,
        ) || null;
    if (!responsibleId || responsibleId === myId) return myId;
    return subordinateIds.includes(responsibleId) ? responsibleId : myId;
};
