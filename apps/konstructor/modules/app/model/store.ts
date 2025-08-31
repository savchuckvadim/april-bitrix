import {
    Action,
    combineReducers,
    configureStore,
    createListenerMiddleware,
    Dispatch,
    Middleware,
    MiddlewareAPI,
    ThunkAction,
} from '@reduxjs/toolkit';
import { appReducer } from './AppSlice';
import { WSClient } from '@workspace/ws';
import { infoblockReducer } from '@/modules/entities/infoblock';
import { offerTemplateBlockReducer } from '@/modules/entities/offer-template-block';
import { complectReducer } from '@/modules/entities/complect';
import { baseTemplateReducer } from '@/modules/entities/base-template';
import { offerTemplateReducer } from '@/modules/entities/offer-template';
import { offerTemplateKonstructorReducer } from '@/modules/entities/offer-template-konstructor';
import { offerReducer } from '@/modules/entities/offer';

export const listenerMiddleware = createListenerMiddleware();
let wsClient: WSClient;

// const socketMiddleware: Middleware = (storeAPI: MiddlewareAPI) => (next: Dispatch<AnyAction>) => (action: AnyAction) => {
//   // Место для обработки действий или взаимодействия с сокетом
//   return next(action);
// };

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

    complect: complectReducer,
    infoblock: infoblockReducer,

    baseTemplate: baseTemplateReducer,
    offer: offerReducer,
    offerTemplate: offerTemplateReducer,
    offerTemplateBlock: offerTemplateBlockReducer,
    offerTemplateKonstructor: offerTemplateKonstructorReducer,
});

export const setupStore = () => {
    return configureStore({
        reducer: rootReducer,
        middleware: getDefaultMiddleware =>
            getDefaultMiddleware({
                thunk: {
                    extraArgument: { getWSClient },
                },
            }),
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
