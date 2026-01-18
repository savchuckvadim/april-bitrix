'use client';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    callingStatisticsApi,
    useGetCallingStatisticsQuery,
} from '../../model/callingStatisticsService';
import { Preloader } from '@/modules/shared';

export const useCallingStatistics = () => {
    const report = useAppSelector(state => state.report);
    const department = useAppSelector(state => state.department);
    const app = useAppSelector(state => state.app);
    const isLoading = useAppSelector(
        state => state.callingStatistics.isLoading,
    );
    const data = useAppSelector(state => state.callingStatistics.items);

    // const { data, isLoading, isFetching } = useGetCallingStatisticsQuery(
    //     {
    //         domain: app.domain,
    //         filters: {
    //             dateFrom: report.date.from,
    //             dateTo: report.date.to,
    //             userIds: department.current.map(user => user.ID),
    //             departament: department.current,
    //             userFieldId: '',
    //             dateFieldId: '',
    //             actionFieldId: '',
    //             currentActions: {}
    //         }
    //     },
    //     { skip: !report.isFetched }
    // )

    // if (isLoading) return { isLoading, content: <div className='w-screen h-screen flex justify-center items-center'> <Preloader /></div > }
    // if (!data) return { isLoading, content: null }

    // const select = callingStatisticsApi.endpoints.getCallingStatistics.select({
    //   domain: app.domain,
    //   filters: {
    //     dateFrom: report.date.from,
    //     dateTo: report.date.to,
    //     userIds: department.current.map(user => user.ID),
    //     departament: department.current,
    //     userFieldId: '',
    //     dateFieldId: '',
    //     actionFieldId: '',
    //     currentActions: {},
    //   }
    // });

    // const queryState = useAppSelector(select);

    // const data = queryState.data;
    // const isLoading = queryState.isLoading;
    // // const isFetching = queryState.isFetched;

    return { data, isLoading };
    // return { isLoading, data, isFetching }
};
