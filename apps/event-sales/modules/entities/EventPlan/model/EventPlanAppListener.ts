import { appActions } from '@/modules/app/model/slice/AppSlice';
import {
    getClientContext,
    getIsTmcMode,
} from '@/modules/app/lib/utills/app-state-util';
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
 * isTmc читается из состояния отдела, а не хардкодится false: режим ТМЦ
 * восстанавливается из localStorage ещё ДО setAppData (setDepartmentMode в
 * app-init), и хардкод здесь затирал его полным списком типов.
 */
export function startEventPlanAppListener(startAppListening: AppStartListening) {
    startAppListening({
        actionCreator: appActions.setAppData,
        effect: (_action, listenerApi) => {
            const state = listenerApi.getState();
            listenerApi.dispatch(
                eventPlanActions.init({
                    isTmc: getIsTmcMode(state),
                    context: getClientContext(state),
                }),
            );
        },
    });
}
