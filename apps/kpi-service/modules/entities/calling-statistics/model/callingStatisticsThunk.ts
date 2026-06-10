import { ReportCallingData } from '../type/calling-type';
import { callingStatisticsActions } from './callingStatisticsSlice';
import { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { ReportRequest } from '../../report/model/report-service';
import { fetchCallingStatistics } from '../lib/helper';

export const getCallingStatistics =
    (reportData: ReportRequest) =>
        async (dispatch: AppDispatch, getState: AppGetState) => {
            const isLoading = getState().callingStatistics.isLoading;
            if (!isLoading) {
                const state = getState();
                dispatch(callingStatisticsActions.setLoading(true));

                const reportResponse: ReportCallingData[] | null =
                    await fetchCallingStatistics(reportData);

                const enrichedResponse =
                    reportResponse?.map(item => {
                        const user = item.user;
                        if (!user) return item;
                        const fullName = [user.NAME, user.LAST_NAME]
                            .filter(Boolean)
                            .join(' ')
                            .trim();
                        return fullName ? { ...item, userName: fullName } : item;
                    }) ?? null;

                dispatch(callingStatisticsActions.setFetched(enrichedResponse));
                dispatch(callingStatisticsActions.setLoading(false));
            }
        };
