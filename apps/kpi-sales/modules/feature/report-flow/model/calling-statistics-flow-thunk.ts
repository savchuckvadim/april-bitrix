import {
    CallingStatisticResponseDto,
    GetCallingStatisticDto,
} from '@workspace/nest-kpi-report-sales-api';
import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import {
    pickCalculationInfo,
    type WithCalculationInfo,
} from '@/modules/shared/lib/calculation-info/calculation-info';
import {
    modifyDateToReportRequest,
    ReportDateType,
} from '@/modules/entities/report';
import { ReportCallingData } from '@/modules/entities/calling-statistics';
import { callingStatisticsActions } from '@/modules/entities/calling-statistics';
import { CallingStatisticsHelper } from '@/modules/entities/calling-statistics';
import { safeSocketId } from '@/modules/entities/airtime';
import {
    buildReportFlowRequestKey,
    isCurrentKey,
    markLoadedKey,
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
        const from = report.date[ReportDateType.FROM];
        const to = report.date[ReportDateType.TO];
        if (!from || !to || !users.length) return;

        // Ключ — ISO из стейта (совпадает с нормализованным эхом бэка).
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

        // В Битрикс — исторический dd.MM.yyyy с +1 днём (инцидент
        // 2026-07-30: ISO ломал списковые фильтры дат).
        const bitrixDates = modifyDateToReportRequest(from, to);

        const request = {
            domain: app.domain,
            filters: {
                dateFrom: bitrixDates.from,
                dateTo: bitrixDates.to,
                departament: users,
            },
            mode: 'queue',
            socketId: safeSocketId(),
            forceRefresh: options.poll ? undefined : options.forceRefresh,
        } as unknown as GetCallingStatisticDto;

        try {
            // Сгенерированный клиент о сведениях расчёта ещё не знает.
            const envelope: WithCalculationInfo<CallingStatisticResponseDto> =
                await callingStatisticsHelper.getStatistics(request);

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
                    pickCalculationInfo(envelope),
                ),
            );
            dispatch(callingStatisticsActions.setLoading(false));
            // Статистика получена — загружена для этого ключа (ошибка
            // расчёта и сбой запроса сюда не доходят и отметку не ставят).
            markLoadedKey('calling', requestKey);
        } catch (error) {
            if (!isCurrentKey('calling', requestKey)) return;
            console.error('calling statistics error:', error);
            dispatch(callingStatisticsActions.setFetched(null));
            dispatch(callingStatisticsActions.setLoading(false));
        }
    };
