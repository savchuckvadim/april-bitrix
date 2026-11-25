import type { ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import { appActions } from '@/modules/app/model/AppSlice';
import type {
    AppDispatch,
    RootState,
    ThunkExtraArgument,
} from '@/modules/app/model/store';
import { loadPortalView } from '../portal-view-thunks';

/**
 * Настройки вида отчёта грузятся один раз, когда данные приложения готовы
 * (setAppData: портал и реальный пользователь известны). Они нужны и отчёту
 * (вкладки, графики), и «Разборам звонков», и странице настроек. Смена
 * «Смотреть как…» не перечитывает их: спрашиваем от имени реального
 * пользователя, а права на правку гасит хук.
 */
export const startPortalViewListener = (
    listener: ListenerMiddlewareInstance<
        RootState,
        AppDispatch,
        ThunkExtraArgument
    >,
) => {
    listener.startListening({
        actionCreator: appActions.setAppData,
        effect: async (_action, { dispatch }) => {
            await dispatch(loadPortalView());
        },
    });
};
