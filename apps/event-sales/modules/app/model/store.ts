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

// processes / entities / shared / april reducers (features добавляются по фазам миграции)
import { eventReducer } from '@/modules/processes/event/model/EventSlice';
import { eventTaskReducer } from '@/modules/entities/EventTask';
import { eventCompanyReducer } from '@/modules/entities/EventCompany';
import { eventContactReducer } from '@/modules/entities/EventContact';
import { eventReportReducer } from '@/modules/entities/EventReport';
import { eventPlanReducer, planScheduleReducer } from '@/modules/entities/EventPlan';
import { eventPresentationReducer } from '@/modules/entities/EventPresentation';
import { eventSaleReducer } from '@/modules/entities/EventSale';
import { eventPostFailReducer } from '@/modules/entities/EVPostFail';
import { eventLeadReducer } from '@/modules/entities/EVLid';
import { eventHistoryReducer } from '@/modules/entities/EVHistory';
import { eventCallingRecordReducer } from '@/modules/entities/EventCallingRecord';
import { departmentReducer } from '@/modules/features/Departament';
import { noCallReducer } from '@/modules/features/NoCall';
import { returnToTmcReducer } from '@/modules/features/ReturnToTMC';
import { afterPresentationReducer } from '@/modules/features/AfterPresentation';
import { eventItemReducer } from '@/modules/widgets/EventItem/model/EventItemSlice';
import { preloaderReducer } from '@/modules/shared/Preloader';
import { portalAPI, portalReducer } from '@workspace/pbx';
import { startStoreListeners } from './listeners/start-store-listeners';

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

const rootReducer = combineReducers({
    app: appReducer,
    preloader: preloaderReducer,

    // processes (роутинг — нативный Next, слайсов роутера нет)
    event: eventReducer,

    // widgets
    eventItemMenu: eventItemReducer,

    // entities
    eventTask: eventTaskReducer,
    company: eventCompanyReducer,
    contact: eventContactReducer,
    eventReport: eventReportReducer,
    eventPlan: eventPlanReducer,
    planSchedule: planScheduleReducer,
    eventPresentation: eventPresentationReducer,
    eventSale: eventSaleReducer,
    eventPostFail: eventPostFailReducer,
    eventLead: eventLeadReducer,
    eventHistory: eventHistoryReducer,
    eventCallingRecord: eventCallingRecordReducer,

    // features
    department: departmentReducer,
    noCall: noCallReducer,
    returnToTmc: returnToTmcReducer,
    afterPresentation: afterPresentationReducer,

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
                .concat(portalAPI.middleware),
    });
};

// Побочные реакции (X случилось → сделать Y) регистрируются здесь,
// а не диспатчатся из вложенных thunk'ов.
startStoreListeners(listenerMiddleware);

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
