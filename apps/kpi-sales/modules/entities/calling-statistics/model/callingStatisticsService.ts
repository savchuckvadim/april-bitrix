import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { fetchCallingStatistics } from '../lib/helper';
import { ReportRequest } from '../../report/model/report-service';
import { ReportCallingData } from '../type/calling-type';

export const callingStatisticsApi = createApi({
    reducerPath: 'callingStatisticsApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    endpoints: (builder) => ({
        getCallingStatistics: builder.query<ReportCallingData[] | null, ReportRequest>({
            queryFn: async (reportData) => {

                try {
              
                    const data = await fetchCallingStatistics(reportData);
                    return { data };
                } catch (error) {
                    return { error: { status: 'CUSTOM_ERROR', error: 'Failed to fetch calling statistics' } };
                }
            }
        }),
        updateCallingStatistics: builder.mutation({
            query: (data) => ({
                url: '/calling-statistics',
                method: 'POST',
                body: data
            })
        })
    })
});

export const {
    useGetCallingStatisticsQuery,
    useUpdateCallingStatisticsMutation
} = callingStatisticsApi;
