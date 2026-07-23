import { GetCallingStatisticDto } from '@workspace/nest-kpi-report-sales-api';
import { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { modifyDateToReportRequest } from '../../report/lib/date-util';
import { ReportDateType } from '../../report/model/types/report/report-type';
import { ReportCallingData } from '../type/calling-type';
import { callingStatisticsActions } from './callingStatisticsSlice';
import { CallingStatisticsHelper } from '../lib/api/calling-statistics-helper';

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
