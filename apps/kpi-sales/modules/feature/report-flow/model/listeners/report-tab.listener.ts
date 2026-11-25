import type { ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import type {
    AppDispatch,
    RootState,
    ThunkExtraArgument,
} from '@/modules/app/model/store';
import { reportTypeActions } from '@/modules/feature/report-widget-type/model/ReportTypeSlice';
import { ensureReportData } from '../ensure-report-data.thunk';

/**
 * Смена вкладки отчёта → догрузка недостающих данных: пользователь пришёл
 * на вкладку отчёта с «Дайджеста», «Финансов» или «AI аналитики» (там
 * события и звонки не запрашивались, либо фильтр сменили без запроса) —
 * ensureReportData запросит ровно то, что новой вкладке нужно и ещё не
 * загружено для действующего фильтра. Вкладке без нужд — ничего.
 *
 * Страницы отчёта и готовность фильтра ensureReportData проверяет сама:
 * вкладку ставят и до применения сохранённого фильтра (настройки
 * интерфейса, домен, ссылка `?tab=`) — тогда запроса ещё нет.
 */
export const startReportTabListener = (
    listener: ListenerMiddlewareInstance<
        RootState,
        AppDispatch,
        ThunkExtraArgument
    >,
) => {
    listener.startListening({
        actionCreator: reportTypeActions.setCurrentReportType,
        effect: async (_action, { dispatch }) => {
            dispatch(ensureReportData());
        },
    });
};
