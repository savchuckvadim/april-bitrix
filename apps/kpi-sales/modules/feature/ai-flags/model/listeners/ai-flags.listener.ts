import { isAnyOf, ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import { appActions } from '@/modules/app/model/AppSlice';
import type {
    AppDispatch,
    RootState,
    ThunkExtraArgument,
} from '@/modules/app/model/store';
// Прямые пути, без бареля сущности: слушатель исполняется при сборке стора,
// а барель тянет UI (см. комментарий в modules/app/model/store.ts).
import { aiAnalyticsActions } from '@/modules/entities/ai-analytics/model/ai-analytics-slice';
import { fetchAiSettings } from '@/modules/entities/ai-analytics/model/ai-analytics-thunks';

/**
 * Портальный уровень включения AI-аналитики: после загрузки приложения
 * (setAppData) дёргаем settings/get и кладём ai_analytics_enabled в
 * app.features.aiAnalyticsPortalEnabled; сами настройки (readiness,
 * callTypes, comparableFrom, ropUserIds, флаги) остаются в слайсе
 * entities/ai-analytics. Константа APP_FEATURES.aiAnalytics = false гасит
 * и запрос. Смена «Смотреть как…» — перечитка от имени просматриваемого.
 */
export const startAiFlagsListener = (
    listener: ListenerMiddlewareInstance<
        RootState,
        AppDispatch,
        ThunkExtraArgument
    >,
) => {
    listener.startListening({
        matcher: isAnyOf(appActions.setAppData, appActions.setViewAsUser),
        effect: async (_action, { dispatch, getState }) => {
            if (!getState().app.features.aiAnalytics) return;
            dispatch(aiAnalyticsActions.resetData());
            await dispatch(fetchAiSettings(true));
            const settings = getState().aiAnalytics.settings.data;
            dispatch(
                appActions.setFeatures({
                    aiAnalyticsPortalEnabled: settings?.enabled ?? false,
                }),
            );
        },
    });
};
