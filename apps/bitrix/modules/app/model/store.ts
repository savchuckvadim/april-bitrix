import {
    Action,
    combineReducers,
    configureStore,
    createListenerMiddleware,
    Middleware,
    ThunkAction,
} from '@reduxjs/toolkit';

import { WSClient } from '@workspace/ws';
import { appReducer } from './slice/AppSlice';
import { errorHandler } from '../lib/error-handler';
import { authReducer } from '@/modules/processes/auth';
import { portalReducer } from '@/modules/entities/portal/model';
import { startPortalClientListener } from '@/modules/entities/portal/model/listener/PortalClientListener';


const listenerMiddleware = createListenerMiddleware();
let wsClient: WSClient;

// const socketMiddleware: Middleware = (storeAPI: MiddlewareAPI) => (next: Dispatch<AnyAction>) => (action: AnyAction) => {
//   // Место для обработки действий или взаимодействия с сокетом
//   return next(action);
// };

// Middleware для обработки ошибок
const errorMiddleware: Middleware = storeAPI => next => action => {
    try {
        return next(action);
    } catch (error) {
        console.error('Redux Error:', error);
        // Обрабатываем ошибку через ErrorHandler
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
    auth: authReducer,


    //entities
    portal: portalReducer,
});

export const setupStore = () => {
    startPortalClientListener(listenerMiddleware);
    return configureStore({
        reducer: rootReducer,
        middleware: getDefaultMiddleware =>
            getDefaultMiddleware({
                thunk: {
                    extraArgument: { getWSClient },
                },
            })
                .concat(errorMiddleware)
                .concat(listenerMiddleware.middleware),
        // .concat(portalAPI.middleware)
        // .concat(infoblockAPI.middleware)

        // .concat(reportMiddleware)
    });
};

//listeners
// portalListener();

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

//@ts-ignore
// window.eventStore = store;
