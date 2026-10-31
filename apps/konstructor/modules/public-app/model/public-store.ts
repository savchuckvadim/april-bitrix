import {
    combineReducers,
    configureStore,
    createListenerMiddleware,
    type Action,
    type ThunkAction,
} from '@reduxjs/toolkit';
import { coreReducers } from '@/modules/app/model/core-reducers';
import {
    publicAccessActions,
    publicAccessReducer,
} from './PublicAccessSlice';
import { startPublicListeners } from './public-listeners';

const combinedReducer = combineReducers({
    ...coreReducers,
    publicAccess: publicAccessReducer,
});

type PublicRootState = ReturnType<typeof combinedReducer>;

/** Отозванная ссылка стирает каталог и сборку из памяти вкладки, остаётся статус. */
const rootReducer = (
    state: PublicRootState | undefined,
    action: Action,
): PublicRootState =>
    combinedReducer(
        publicAccessActions.linkGone.match(action) ? undefined : state,
        action,
    );

/**
 * Стор публичной версии: только ядро сборки и статус ссылки. Экраны шагов те же
 * и читают те же срезы; сделки, портала и пользователя здесь нет.
 */
export const setupPublicStore = () => {
    const listenerMiddleware = createListenerMiddleware();
    startPublicListeners(listenerMiddleware);
    return configureStore({
        reducer: rootReducer,
        middleware: getDefaultMiddleware =>
            getDefaultMiddleware().concat(listenerMiddleware.middleware),
    });
};

export const publicStore = setupPublicStore();

export type PublicStore = ReturnType<typeof setupPublicStore>;
export type PublicState = PublicRootState;
export type PublicDispatch = PublicStore['dispatch'];
export type PublicThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    PublicState,
    undefined,
    Action<string>
>;
