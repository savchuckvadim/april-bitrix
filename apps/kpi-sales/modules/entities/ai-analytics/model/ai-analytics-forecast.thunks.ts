import type { AppDispatch } from '@/modules/app/model/store';
import { loadSection } from './ai-analytics-sync.thunks';
import { aiHelper } from './ai-analytics-thunks.shared';

/*
 * Прогноз отдела на месяц (Фаза 4, POST ai-analytics/forecast): синхронная
 * ручка без кэша, только руководителям. Месяц — текущий в часовом поясе
 * портала (его выбирает сервер), поэтому в ключе только маркер ручки:
 * повторно не запрашиваем, пока секция готова (force — перечитать).
 */

/** Маркер ключа запроса секции прогноза. */
export const AI_FORECAST_KEY_PART = 'forecast';

export const fetchAiForecast =
    (force = false) =>
    async (dispatch: AppDispatch): Promise<void> => {
        await dispatch(
            loadSection(
                'forecast',
                requester => aiHelper.getForecast(requester),
                { force, extra: [AI_FORECAST_KEY_PART] },
            ),
        );
    };
