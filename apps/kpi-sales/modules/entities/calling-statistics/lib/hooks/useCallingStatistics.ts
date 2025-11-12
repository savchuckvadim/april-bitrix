import { useAppSelector } from '@/modules/app/lib/hooks/redux';
// import {
//     callingStatisticsApi,
//     useGetCallingStatisticsQuery,
// } from '../../model/callingStatisticsService';
// import { Preloader } from '@/modules/shared';

export const useCallingStatistics = () => {
    const report = useAppSelector(state => state.report);
    const department = useAppSelector(state => state.department);
    const app = useAppSelector(state => state.app);
    const isLoading = useAppSelector(
        state => state.callingStatistics.isLoading,
    );
    const data = useAppSelector(state => state.callingStatistics.items);



    return { data, isLoading };

};
