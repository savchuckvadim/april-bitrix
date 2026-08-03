import { appActions } from '@/modules/app/model/slice/AppSlice';
import type { AppStartListening } from '@/modules/app/model/store';
import { eventPlanActions } from './EventPlanSlice';

/**
 * Listener слайса плана на app/setAppData.
 *
 * setAppData — момент, когда в состоянии впервые есть домен, config и текущая
 * сущность Битрикса (компания/сделка/лид/задача, from). От неё и инициализируем
 * план: реакция «app загрузился → инициализировать план» живёт listener'ом,
 * а не вложенным dispatch'ем внутри app-thunk'а.
 *
 * startAppListening типизирован в store: `listenerApi.getState()` здесь — RootState,
 * `dispatch` принимает thunk'и. Кастов (`as RootState` / `as AppDispatch`) не нужно.
 */
export function startEventPlanAppListener(startAppListening: AppStartListening) {
    startAppListening({
        actionCreator: appActions.setAppData,
        effect: (_action, listenerApi) => {
            const state = listenerApi.getState();
            const hasCompany = !!state.app.bitrix.company;
            listenerApi.dispatch(eventPlanActions.init({
                hasCompany,
                isTmc: false,
            }));
        },
    });
}
