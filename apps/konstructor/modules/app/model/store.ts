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
import { WSClient } from '@/modules/shared';
import { WSClient as WSClientWorkspace } from '@workspace/ws';
import { infoblockReducer } from '@/modules/entities/infoblock';
import { offerTemplateBlockReducer } from '@/modules/entities/offer-template-block';
import { complectReducer } from '@/modules/entities/complect';
import { baseTemplateReducer } from '@/modules/entities/base-template';
import { offerTemplateReducer } from '@/modules/entities/offer-template';
import { offerTemplateKonstructorReducer } from '@/modules/entities/offer-template-konstructor';
import { offerReducer } from '@/modules/entities/offer';
import { errorHandler } from '../lib/error-handler';
import { wordTemplate, wordTemplatePdfPreviewReducer } from '@/modules/entities/offer-template-word/';
import { portalReducer } from '@/modules/entities/portal';
import { documentProviderReducer } from '@/modules/entities/provider';
import { dealReducer } from '@/modules/entities/deal';
import { bxrqReducer } from '@workspace/bx-rq';

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
    bxrq: bxrqReducer,

    deal: dealReducer,
    complect: complectReducer,
    infoblock: infoblockReducer,
    portal: portalReducer,

    documentProvider: documentProviderReducer,
    baseTemplate: baseTemplateReducer,
    offer: offerReducer,
    offerTemplate: offerTemplateReducer,
    offerTemplateBlock: offerTemplateBlockReducer,
    offerTemplateKonstructor: offerTemplateKonstructorReducer,
    offerTemplateWord: wordTemplate,
    wordTemplatePdfPreview: wordTemplatePdfPreviewReducer,
});


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


export const setupStore = () => {
    return configureStore({
        reducer: rootReducer,
        middleware: getDefaultMiddleware =>
            getDefaultMiddleware({
                thunk: {
                    extraArgument: { getWSClient: WSClient.getClient },
                },
            })
                .concat(errorMiddleware)
                .concat(listenerMiddleware.middleware),
        // .concat(portalAPI.middleware)
        // .concat(infoblockAPI.middleware)

        // .concat(reportMiddleware)
    });
};


// Тип для extraArgument
export type ThunkExtraArgument = {
    getWSClient: () => WSClientWorkspace;
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
