import { portalActions } from '@workspace/pbx';
import { setInitEventCompany } from '@/modules/entities/EventCompany/model/EventCompanyThunk';
import { getCompanyContacts } from '@/modules/entities/EventContact/model/EventContactThunk';
import { eventTaskActions } from '@/modules/entities/EventTask/model/EventTaskSlice';
import { getInitSale } from '@/modules/entities/EventSale/model/EventSaleThunk';
import { getEventSalesHistory } from '@/modules/entities/EVHistory/model/EVHistoryThunk';
import { fetchResults } from '@/modules/features/NoCall/model/NoCallThunk';
import { initReturnToTMC } from '@/modules/features/ReturnToTMC/model/ReturnToTMCThunk';
import { initCheckPresentation } from '@/modules/features/AfterPresentation/model/AfterPresentationThunk';
import { startEventPlanAppListener } from '@/modules/entities/EventPlan/model/EventPlanAppListener';
import type { AppStartListening } from '../store';

/**
 * Единая точка регистрации RTK-listeners приложения.
 *
 * Паттерн: побочные реакции («портал загружен → инициализировать компанию»,
 * «задачи загружены → подтянуть сделки») регистрируются здесь как listeners,
 * а не диспатчатся из вложенных thunk'ов.
 *
 * На вход — типизированный startAppListening из store: внутри effect'ов
 * `getState()` уже RootState, `dispatch` уже AppDispatch, кастов не нужно.
 */
export function startStoreListeners(startAppListening: AppStartListening) {
    // Портал загружен → поля компании (цвет/статус) + контакты компании.
    // Ждём (до 5с), пока initial() положит bitrix.company в app state.
    startAppListening({
        actionCreator: portalActions.setPortal,
        effect: async (action, listenerApi) => {
            const portal = action.payload.portal;
            const { dispatch } = listenerApi;

            await listenerApi.condition(
                (_action, currentState) => !!currentState.app?.bitrix?.company,
                5000,
            );

            dispatch(setInitEventCompany(portal));
            dispatch(getCompanyContacts(portal));
            dispatch(getEventSalesHistory());
            dispatch(initCheckPresentation());
        },
    });

    // Задачи загружены → сделки для продажи, счётчики результатов,
    // ТМЦ-сделки для возврата (гейты — внутри thunk'ов).
    startAppListening({
        actionCreator: eventTaskActions.setFetchedTasks,
        effect: async (action, listenerApi) => {
            const { dispatch } = listenerApi;
            dispatch(getInitSale(action.payload.tasks));
            dispatch(fetchResults());
            if (action.payload.tasks?.length) {
                dispatch(initReturnToTMC(action.payload.tasks));
            }
        },
    });

    // Подписки, живущие внутри своих слайсов (app/setAppData → инициализация плана).
    startEventPlanAppListener(startAppListening);
}
