export { default as callingStatisticsReducer , callingStatisticsActions} from './model/callingStatisticsSlice';
export { getCallingStatistics } from './model/callingStatisticsThunk';
export {
    callingStatisticsApi,
    useGetCallingStatisticsQuery,
    useUpdateCallingStatisticsMutation
} from './model/callingStatisticsService';
export type { ReportCallingData } from './type/calling-type';
export {default as CallingStatistics } from './ui/CallingStatistics';

