import type { AppStartListening } from '@/modules/app/model/store';
import {
    EventItemResultType,
    eventItemActions,
} from '@/modules/widgets/EventItem/model/EventItemSlice';
import { buildRescheduleSeed } from '../lib/plan-reschedule';
import { eventPlanActions } from './EventPlanSlice';

/**
 * Listener «открыли „Не очень“ → план перестраивается под перенос».
 *
 * Реакция живёт здесь, а не внутри getResultMenu: правило репо — «X случилось
 * → сделать Y» регистрируется listener'ом. Момент выбран по
 * setEventItemMenuStatus: к нему текущая задача уже в состоянии (её ставит
 * тот же thunk строкой выше).
 */
export function startEventPlanRescheduleListener(
    startAppListening: AppStartListening,
) {
    startAppListening({
        actionCreator: eventItemActions.setEventItemMenuStatus,
        effect: (action, listenerApi) => {
            if (action.payload.menuType !== EventItemResultType.NORESULT) {
                return;
            }
            const task = listenerApi.getState().eventTask.current;
            if (!task) return;
            listenerApi.dispatch(
                eventPlanActions.seedFromTask(buildRescheduleSeed(task)),
            );
        },
    });
}
