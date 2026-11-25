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
    // Приходил ли ответ (в том числе пустой/с ошибкой): до него данных нет
    // не потому, что звонков нет, а потому что их ещё не загрузили.
    const isFetched = useAppSelector(
        state => state.callingStatistics.isFetched,
    );
    const data = useAppSelector(state => state.callingStatistics.items);



    return { data, isLoading, isFetched };

};
