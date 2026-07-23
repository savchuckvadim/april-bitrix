import { isAnyOf, ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import { appActions } from '@/modules/app/model/AppSlice';
import {
    AppDispatch,
    RootState,
    ThunkExtraArgument,
} from '@/modules/app/model/store';
import { mergedReportActions } from '../MergedReportSlice';
import {
    loadMergedFilter,
    saveMergedFilter,
} from '../../lib/merged-filter-storage.util';

/**
 * Локальный фильтр объединённого отчёта:
 * при инициализации — гидратация из localStorage (иначе таблица сама
 * выберет всех), при изменении — сохранение.
 */
export const startMergedFilterListeners = (
    listener: ListenerMiddlewareInstance<
        RootState,
        AppDispatch,
        ThunkExtraArgument
    >,
) => {
    listener.startListening({
        matcher: isAnyOf(appActions.setAppData),
        effect: async (_action, { dispatch, getState }) => {
            const stored = loadMergedFilter(getState().app.domain);
            if (!stored) return;
            if (stored.selectedUsers.length) {
                dispatch(
                    mergedReportActions.setSelectedUsers(stored.selectedUsers),
                );
            }
            if (stored.selectedActions.length) {
                dispatch(
                    mergedReportActions.setSelectedActions(
                        stored.selectedActions,
                    ),
                );
            }
        },
    });

    listener.startListening({
        matcher: isAnyOf(
            mergedReportActions.setSelectedUsers,
            mergedReportActions.setSelectedActions,
        ),
        effect: async (_action, { getState }) => {
            const { app, mergedReport } = getState();
            saveMergedFilter(app.domain, {
                selectedUsers: mergedReport.selectedUsers,
                selectedActions: mergedReport.selectedActions,
            });
        },
    });
};
