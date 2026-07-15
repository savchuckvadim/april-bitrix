import { ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import { portalActions } from '@workspace/pbx';
import { setInitEventCompany } from '@/modules/entities/EventCompany/model/EventCompanyThunk';
import { getCompanyContacts } from '@/modules/entities/EventContact/model/EventContactThunk';
import { eventTaskActions } from '@/modules/entities/EventTask/model/EventTaskSlice';
import { getInitSale } from '@/modules/entities/EventSale/model/EventSaleThunk';
import { getEventSalesHistory } from '@/modules/entities/EVHistory/model/EVHistoryThunk';
import { fetchResults } from '@/modules/features/NoCall/model/NoCallThunk';
import { initReturnToTMC } from '@/modules/features/ReturnToTMC/model/ReturnToTMCThunk';
import { initCheckPresentation } from '@/modules/features/AfterPresentation/model/AfterPresentationThunk';
import type { AppDispatch, RootState } from '../store';

/**
 * Единая точка регистрации RTK-listeners приложения.
 *
 * Паттерн: побочные реакции («портал загружен → инициализировать компанию»,
 * «задачи загружены → подтянуть сделки») регистрируются здесь как listeners,
 * а не диспатчатся из вложенных thunk'ов.
 */
export function startStoreListeners(
    listenerMiddleware: ListenerMiddlewareInstance,
) {
    // Портал загружен → поля компании (цвет/статус) + контакты компании.
    // Ждём (до 5с), пока initial() положит bitrix.company в app state.
    listenerMiddleware.startListening({
        actionCreator: portalActions.setPortal,
        effect: async (action, listenerApi) => {
            const portal = action.payload.portal;
            const dispatch = listenerApi.dispatch as AppDispatch;

            await listenerApi.condition((_action, currentState) => {
                const state = currentState as RootState;
                return !!state.app?.bitrix?.company;
            }, 5000);

            dispatch(setInitEventCompany(portal));
            dispatch(getCompanyContacts(portal));
            dispatch(getEventSalesHistory());
            dispatch(initCheckPresentation());
        },
    });

    // Задачи загружены → сделки для продажи, счётчики результатов,
    // ТМЦ-сделки для возврата (гейты — внутри thunk'ов).
    listenerMiddleware.startListening({
        actionCreator: eventTaskActions.setFetchedTasks,
        effect: async (action, listenerApi) => {
            const dispatch = listenerApi.dispatch as AppDispatch;
            dispatch(getInitSale(action.payload.tasks));
            dispatch(fetchResults());
            if (action.payload.tasks?.length) {
                dispatch(initReturnToTMC(action.payload.tasks));
            }
        },
    });
}
