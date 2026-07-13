import {
    Action,
    combineReducers,
    configureStore,
    createListenerMiddleware,
    Middleware,
    ThunkAction,
} from '@reduxjs/toolkit';

import { WSClient } from '@workspace/ws';
import { appReducer } from '../';
import { errorHandler } from '../lib/error-handler';

// entities / processes / features / widgets / shared reducers
import { eventTaskReducer, eventTaskActions, taskAPI } from '@/modules/entities/EventTask';
import { eventReducer, eventRouterReducer } from '@/modules/processes/event';
import { routerReducer } from '@/modules/processes/routes/model/RouterSlice';
import { eventItemReducer } from '@/modules/widgets/EventItem/model/EventItemSlice';
import { eventReportReducer } from '@/modules/entities/EventReport/model/EventReportSlice';
import { eventPresentationReducer } from '@/modules/entities/EventPresentation';
import { eventPlanReducer, eventPlanServiceReducer } from '@/modules/entities/EventPlan';
import { departmentReducer } from '@/modules/features/Departament';
import { preloaderReducer } from '@/modules/shared/Preloader';
import { eventSaleReducer } from '@/modules/entities/EventSale/model/EventSaleSlice';
import { eventContactReducer } from '@/modules/entities/EventContact';
import { eventCompanyReducer } from '@/modules/entities/EventCompany';
import { setInitEventCompany } from '@/modules/entities/EventCompany/model/EventCompanyThunk';
import { eventCommunicationReducer } from '@/modules/features/Communication';
import { serviceResultsReducer } from '@/modules/entities/ServiceResults';
import { eventServiceTaskReducer } from '@/modules/entities/EventServiceTask/model/EventServiceTaskSlice';
import { portalActions, portalAPI, portalReducer } from '@workspace/pbx';
import { portalListener } from '@/modules/entities/April/Portal';
import { serviceSignalReducer } from '@/modules/features/ServiceSiganal';

export const listenerMiddleware = createListenerMiddleware();
let wsClient: WSClient;

// Middleware для обработки ошибок
const errorMiddleware: Middleware = storeAPI => next => action => {
    try {
        return next(action);
    } catch (error) {
        console.error('Redux Error:', error);
        errorHandler.handleAsyncError(error);
        return next(action);
    }
};

export const initWSClient = (userId: number, domain: string) => {
    wsClient = new WSClient(userId, domain);
    return wsClient;
};

export const getWSClient = () => {
    if (!wsClient) throw new Error('WSClient not initialized');
    return wsClient;
};

listenerMiddleware.startListening({
    actionCreator: eventTaskActions.setFetchedTasks,
    effect: async (action, listenerApi) => {
        const { dispatch } = listenerApi;
        // place for task-driven side effects
    },
});

listenerMiddleware.startListening({
    actionCreator: portalActions.setPortal,
    effect: async (action, listenerApi) => {
        const portal = action.payload.portal;
        const dispatch = listenerApi.dispatch as AppDispatch;
        dispatch(setInitEventCompany(portal));
    },
});

const rootReducer = combineReducers({
    app: appReducer,
    preloader: preloaderReducer,

    // processes
    router: routerReducer,
    event: eventReducer,
    eventRouter: eventRouterReducer,

    // widgets
    eventItemMenu: eventItemReducer,

    // entities
    eventTask: eventTaskReducer,
    [taskAPI.reducerPath]: taskAPI.reducer,
    eventServiceTask: eventServiceTaskReducer,
    eventReport: eventReportReducer,
    eventPresentation: eventPresentationReducer,
    eventPlan: eventPlanReducer,
    eventPlanService: eventPlanServiceReducer,
    eventSale: eventSaleReducer,
    eventCommunication: eventCommunicationReducer,
    serviceResults: serviceResultsReducer,
    company: eventCompanyReducer,
    contact: eventContactReducer,

    // features
    department: departmentReducer,
    serviceSignal: serviceSignalReducer,

    // april
    portal: portalReducer,
    [portalAPI.reducerPath]: portalAPI.reducer,
});

export const setupStore = () => {
    return configureStore({
        reducer: rootReducer,
        middleware: getDefaultMiddleware =>
            getDefaultMiddleware({
                thunk: {
                    extraArgument: { getWSClient },
                },
            })
                .prepend(listenerMiddleware.middleware)
                .concat(errorMiddleware)
                .concat(portalAPI.middleware)
                .concat(taskAPI.middleware),
    });
};

// listeners
portalListener();

// Тип для extraArgument
export type ThunkExtraArgument = {
    getWSClient: typeof getWSClient;
};

// Тип для thunk
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    ThunkExtraArgument,
    Action<string>
>;

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];
export type AppGetState = AppStore['getState'];

export const store = setupStore();

if (typeof window !== 'undefined') {
    //@ts-ignore
    window.eventStore = store;
}
