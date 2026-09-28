import { isAnyOf, ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import type {
    AppDispatch,
    RootState,
    ThunkExtraArgument,
} from '@/modules/app/model/store';
import { reportActions } from '@/modules/entities/report/model/report-slice';
import { aiAnalyticsActions } from '../ai-analytics-slice';
import {
    fetchAiAgenda,
    fetchAiAttention,
    fetchAiBrief,
    fetchAiByType,
    fetchAiOverview,
    fetchAiPulse,
    fetchAiTypesMatrix,
} from '../ai-analytics-thunks';

/**
 * Реакции «X случилось → освежить секции AI-аналитики». Первую загрузку
 * делает mount-эффект виджета; здесь — только секции, которые уже
 * открывали (status ≠ idle). Гард thunk'а по requestKey отсекает повтор,
 * если периметр не изменился (пульс и повестка фильтров не берут).
 */
export const startAiRefetchListener = (
    listener: ListenerMiddlewareInstance<
        RootState,
        AppDispatch,
        ThunkExtraArgument
    >,
) => {
    // Смена глобального фильтра (setSavedFilter срабатывает и после
    // перезагрузки структуры в режиме «Смотреть как…»).
    listener.startListening({
        matcher: isAnyOf(reportActions.setSavedFilter),
        effect: async (_action, { dispatch, getState }) => {
            const {
                pulse,
                agenda,
                overview,
                attention,
                byType,
                brief,
                typesMatrix,
            } = getState().aiAnalytics;
            if (pulse.status !== 'idle') dispatch(fetchAiPulse());
            if (agenda.status !== 'idle') dispatch(fetchAiAgenda());
            if (overview.status !== 'idle') dispatch(fetchAiOverview());
            if (attention.status !== 'idle') dispatch(fetchAiAttention());
            if (byType.status !== 'idle') dispatch(fetchAiByType());
            // Резюме периода и матрицы типов живут в периметре обзора — тот же повод.
            if (brief.status !== 'idle') dispatch(fetchAiBrief());
            if (typesMatrix.status !== 'idle') dispatch(fetchAiTypesMatrix());
        },
    });

    // Уровни сохранены: сервер сбросил кэш обзора — перечитываем принудительно.
    listener.startListening({
        matcher: isAnyOf(aiAnalyticsActions.levelsSaved),
        effect: async (_action, { dispatch, getState }) => {
            dispatch(fetchAiOverview({ force: true }));
            dispatch(fetchAiAttention({ force: true }));
            const { byType, typesMatrix } = getState().aiAnalytics;
            if (byType.status !== 'idle') {
                dispatch(fetchAiByType({ force: true }));
            }
            if (typesMatrix.status !== 'idle') {
                dispatch(fetchAiTypesMatrix({ force: true }));
            }
        },
    });

    // Второй уровень: открыли drawer или сменили тип/раскладку — срез по типу.
    listener.startListening({
        matcher: isAnyOf(
            aiAnalyticsActions.setTypesDrawerOpen,
            aiAnalyticsActions.setSelectedCallType,
            aiAnalyticsActions.setTypesLayout,
        ),
        effect: async (_action, { dispatch, getState }) => {
            if (getState().aiAnalytics.typesDrawerOpen)
                dispatch(fetchAiByType());
        },
    });
};
