import { GetCallingStatisticDto } from '@workspace/nest-kpi-report-sales-api';
import { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { modifyDateToReportRequest } from '@/modules/entities/report';
import { ReportDateType } from '@/modules/entities/report';
import { ReportCallingData } from '@/modules/entities/calling-statistics';
import { callingStatisticsActions } from '@/modules/entities/calling-statistics';
import { CallingStatisticsHelper } from '@/modules/entities/calling-statistics';

const callingStatisticsHelper = new CallingStatisticsHelper();

/** Статистика звонков по текущему выбору сотрудников и датам отчёта. */
export const getCallingStatistics =
    () => async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const { app, department, report, callingStatistics } = state;

        if (
            !app.bitrix.user ||
            callingStatistics.isLoading ||
            department.status !== 'ready'
        ) {
            return;
        }
        dispatch(callingStatisticsActions.setLoading(true));

        try {
            const users = department.current.length
                ? department.current
                : department.items;
            const { from, to } = modifyDateToReportRequest(
                report.date[ReportDateType.FROM],
                report.date[ReportDateType.TO],
            );

            const reportResponse: ReportCallingData[] | null =
                await callingStatisticsHelper.getStatistics({
                    domain: app.domain,
                    filters: {
                        dateFrom: from,
                        dateTo: to,
                        departament: users,
                    },
                } as unknown as GetCallingStatisticDto);

            dispatch(callingStatisticsActions.setFetched(reportResponse));
        } catch (error) {
            console.error('calling statistics error:', error);
            dispatch(callingStatisticsActions.setFetched(null));
        } finally {
            dispatch(callingStatisticsActions.setLoading(false));
        }
    };
