import { isAnyOf, ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import {
    AppDispatch,
    RootState,
    ThunkExtraArgument,
} from '@/modules/app/model/store';
import { appActions } from '@/modules/app';
import { fetchShareLinks } from '../report-links-thunks';

/**
 * Загрузка списка публичных ссылок после инициализации приложения
 * (setAppData даёт domain). Независим от цепочки загрузки отчёта.
 */
export const startReportLinksListener = (
    listener: ListenerMiddlewareInstance<
        RootState,
        AppDispatch,
        ThunkExtraArgument
    >,
) => {
    listener.startListening({
        matcher: isAnyOf(appActions.setAppData),
        effect: async (_action, { dispatch }) => {
            dispatch(fetchShareLinks());
        },
    });
};
