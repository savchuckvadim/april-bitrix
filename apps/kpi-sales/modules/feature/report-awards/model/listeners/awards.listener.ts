import { isAnyOf, ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import type { AppDispatch, RootState, ThunkExtraArgument } from '@/modules/app/model/store';
import { reportActions } from '@/modules/entities/report';
import { callingStatisticsActions } from '@/modules/entities/calling-statistics';
import {
    buildConversionResult,
    conversionsActions,
    getDatasetForScope,
} from '@/modules/feature/report-conversions';
import { reportAwardsActions } from '../report-awards-slice';
import { buildAwards } from '../../lib/build-awards.util';

/**
 * Награды-фича: слушает данные ДРУГИХ отчётов (KPI/звонки) и конфиг
 * конверсий; на каждое обновление пересчитывает командную конверсию
 * (merged, БЕЗ локального фильтра выбора — награды по всей команде) и
 * раскладывает награды per-user в reportAwards. UI только читает.
 *
 * Событие редкое (загрузка отчёта / смена цепочки), дебаунс не нужен;
 * гард на пустой отчёт очищает награды.
 */
export const startReportAwardsListener = (
    listener: ListenerMiddlewareInstance<
        RootState,
        AppDispatch,
        ThunkExtraArgument
    >,
) => {
    listener.startListening({
        matcher: isAnyOf(
            reportActions.setFetchedReport,
            callingStatisticsActions.setFetched,
            conversionsActions.setWidgetConfig,
        ),
        effect: async (_action, { dispatch, getState }) => {
            const state = getState();
            const report = state.report.report;
            if (!report.length) {
                dispatch(reportAwardsActions.setAwards({}));
                return;
            }

            const callings = state.callingStatistics.items ?? [];
            const config = state.conversions.widget.merged;
            // Без mergedSelection: награды считаем по всей команде.
            const dataset = getDatasetForScope('merged', report, callings);
            const result = buildConversionResult(
                dataset,
                config.codes,
                config.method,
            );
            dispatch(reportAwardsActions.setAwards(buildAwards(result)));
        },
    });
};
