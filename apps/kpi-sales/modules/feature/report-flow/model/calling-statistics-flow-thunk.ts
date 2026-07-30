import { GetCallingStatisticDto } from '@workspace/nest-kpi-report-sales-api';
import { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { ReportDateType } from '@/modules/entities/report';
import { ReportCallingData } from '@/modules/entities/calling-statistics';
import { callingStatisticsActions } from '@/modules/entities/calling-statistics';
import { CallingStatisticsHelper } from '@/modules/entities/calling-statistics';
import { safeSocketId } from '@/modules/entities/airtime';
import {
    buildReportFlowRequestKey,
    isCurrentKey,
    schedulePoll,
    setCurrentKey,
} from './report-queue.util';

const callingStatisticsHelper = new CallingStatisticsHelper();

interface CallingFetchOptions {
    /** Повторный POST поллинга/WS: без прелоадера и дедуп-гейта. */
    poll?: boolean;
    /** Пересчитать, игнорируя кэш бэка. */
    forceRefresh?: boolean;
}

/**
 * Статистика звонков по текущему выбору сотрудников и датам отчёта.
 *
 * Режим очереди (mode=queue): мгновенный конверт; queued → поллинг 7с +
 * WS kpi-report:calling-statistic:done. Прежний guard по isLoading УДАЛЁН —
 * он был причиной бага «смена периода не перезапрашивает»: пока первый
 * запрос висел под задушенным лимитером, isLoading залипал и все
 * последующие вызовы молча выходили, а доехавший старый ответ записывал
 * числа чужого периода. Теперь смена фильтра устаревает предыдущий ключ,
 * его ответы отбрасываются.
 */
export const getCallingStatistics =
    (options: CallingFetchOptions = {}) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const { app, department, report, callingStatistics } = state;

        if (!app.bitrix.user || department.status !== 'ready') {
            return;
        }

        const users = department.current.length
            ? department.current
            : department.items;
        // Каноничный ISO как есть (границы включительно) — легаси
        // dd.MM.yyyy(+1 день) для этой ручки больше не шлём.
        const from = report.date[ReportDateType.FROM];
        const to = report.date[ReportDateType.TO];
        if (!from || !to || !users.length) return;

        const requestKey = buildReportFlowRequestKey(from, to, users);
        if (
            !options.poll &&
            !options.forceRefresh &&
            isCurrentKey('calling', requestKey) &&
            callingStatistics.isLoading
        ) {
            return;
        }
        setCurrentKey('calling', requestKey);
        if (!options.poll) {
            dispatch(callingStatisticsActions.setLoading(true));
        }

        try {
            const envelope = await callingStatisticsHelper.getStatistics({
                domain: app.domain,
                filters: {
                    dateFrom: from,
                    dateTo: to,
                    departament: users,
                },
                mode: 'queue',
                socketId: safeSocketId(),
                forceRefresh: options.poll ? undefined : options.forceRefresh,
            } as unknown as GetCallingStatisticDto);

            // Фильтр сменился, пока летел ответ — он устарел.
            if (!isCurrentKey('calling', requestKey)) return;

            if (envelope.status === 'queued') {
                schedulePoll('calling', requestKey, () =>
                    void dispatch(getCallingStatistics({ poll: true })),
                );
                return;
            }
            if (envelope.status === 'error') {
                console.error(
                    'calling statistics error:',
                    envelope.message ?? 'расчёт упал',
                );
                dispatch(callingStatisticsActions.setLoading(false));
                return;
            }

            dispatch(
                callingStatisticsActions.setFetched(
                    (envelope.data ?? []) as unknown as ReportCallingData[],
                ),
            );
            dispatch(callingStatisticsActions.setLoading(false));
        } catch (error) {
            if (!isCurrentKey('calling', requestKey)) return;
            console.error('calling statistics error:', error);
            dispatch(callingStatisticsActions.setFetched(null));
            dispatch(callingStatisticsActions.setLoading(false));
        }
    };
