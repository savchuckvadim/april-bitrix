import { isAnyOf } from '@reduxjs/toolkit';
import type { AppStartListening } from '@/modules/app/model/store';
import { eventTaskActions } from '@/modules/entities/EventTask/model/EventTaskSlice';
import { refreshEventTasks } from '@/modules/entities/EventTask/model/EventTaskThunk';
import { planScheduleActions } from '@/modules/entities/EventPlan/model/PlanScheduleSlice';
import { fetchPlanDaySchedule } from '@/modules/entities/EventPlan/model/PlanScheduleThunk';
import { departmentActions } from '@/modules/features/Departament/model/DepartmentSlice';
import {
    DEPARTAMENT_STATE_PROP,
    DUSER_ROLE,
} from '@/modules/features/Departament/type/department-type';
import { notifyHeadPerimeterSettled } from '../lib/head-mode-wait';
import { headModeActions } from './HeadModeSlice';
import { syncActingFromTask } from './HeadModeThunk';
import { selectHeadModeActive } from './selectors';

/**
 * Реакции режима руководителя («X случилось → сделать Y», правило репо).
 */
export function startHeadModeListener(startAppListening: AppStartListening) {
    // Список подчинённых получен или не получен — отпустить ожидающих.
    startAppListening({
        matcher: isAnyOf(headModeActions.setFetched, headModeActions.setFailed),
        effect: () => {
            notifyHeadPerimeterSettled();
        },
    });

    /*
     * За кого идёт работа — пересчитывается на каждое событие, которое
     * может это изменить: открыли или закрыли дело, приехал список
     * подчинённых, приехал отдел (он ставит ответственным текущего
     * пользователя), переключили режим.
     */
    startAppListening({
        matcher: isAnyOf(
            eventTaskActions.setCurrentTask,
            headModeActions.setFetched,
            headModeActions.setEnabled,
            departmentActions.setFetchedDepartament,
        ),
        effect: (_action, listenerApi) => {
            listenerApi.dispatch(syncActingFromTask());
        },
    });

    /*
     * Список дел устарел: режим переключили либо список подчинённых приехал
     * ПОСЛЕ первого запроса дел (медленная сеть — запрос ушёл только со
     * своим id). Во встройке задачи список строится из неё самой.
     */
    startAppListening({
        matcher: isAnyOf(
            headModeActions.setFetched,
            headModeActions.setEnabled,
        ),
        effect: async (action, listenerApi) => {
            const state = listenerApi.getState();
            if (state.app.bitrix.task || !state.app.bitrix.from) return;
            if (!state.eventTask.isFetched) return;
            if (!state.headMode.subordinateIds.length) return;
            // Список приехал, а режим выключен — свои дела уже на экране.
            if (
                headModeActions.setFetched.match(action) &&
                !selectHeadModeActive(state)
            ) {
                return;
            }
            await listenerApi.dispatch(refreshEventTasks());
        },
    });

    // Дело записали на другого — занятость дня показываем его, а не свою.
    startAppListening({
        actionCreator: departmentActions.setCurrentUser,
        effect: async (action, listenerApi) => {
            const { from, role } = action.payload;
            if (
                from !== DEPARTAMENT_STATE_PROP.PLAN ||
                role !== DUSER_ROLE.RESPONSIBLE
            ) {
                return;
            }
            const { date } = listenerApi.getState().planSchedule;
            listenerApi.dispatch(planScheduleActions.reset());
            if (date) await listenerApi.dispatch(fetchPlanDaySchedule(date));
        },
    });
}
