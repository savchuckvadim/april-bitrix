import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getApiHeaders, hookURL } from '@workspace/api';
import { BXUser, BXDepartment } from '@workspace/bx';
import {
    // ReportData,
    FilterInnerCode,
    ReportDateType,
} from './types/report/report-type';
import { ReportGetFiltersDto, ReportData } from '@workspace/nest-api';

const onlineHeaders = getApiHeaders(process.env.ONLINE_API_KEY || '');

export interface ReportResponse {
    allUsers: BXUser[] | null;
    childrenDepartments: BXDepartment[];
    generalDepartment: BXDepartment[];
}

export interface ReportRequest {
    domain: string;
    filters: ReportGetFiltersDto;
    socketId?: string;
}

export interface FilterResponse {
    filter: Array<FilterInnerCode>;
    department: Array<number> | null;
    dates: {
        [ReportDateType.FROM]: string;
        [ReportDateType.TO]: string;
    } | null;
}

export const reportAPI = createApi({
    reducerPath: 'reportAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: `${hookURL}`,
        prepareHeaders: headers => {
            Object.entries(onlineHeaders).forEach(([key, value]) => {
                headers.set(key, value);
            });
            return headers;
        },
    }),
    endpoints: builder => ({
        getReport: builder.query<ReportData[], ReportRequest>({
            query: reportData => ({
                url: 'full/report/get',
                method: 'POST',
                body: reportData,
            }),
        }),
        // getCallingStatistics: builder.query<ReportCallingData[], ReportRequest>({
        //     query: (reportData) => ({
        //         url: 'full/report/callings',
        //         method: 'POST',
        //         body: reportData
        //     })
        // }),
        getFilter: builder.query<
            FilterResponse,
            { domain: string; userId: number }
        >({
            query: ({ domain, userId }) => ({
                url: 'report/settings/get/filter',
                method: 'POST',
                body: { domain, userId },
            }),
        }),
        saveFilter: builder.mutation<
            void,
            {
                domain: string;
                userId: number;
                filter: {
                    actions: string;
                    dates: string;
                    department: string;
                };
            }
        >({
            query: data => ({
                url: 'report/settings/filter',
                method: 'POST',
                body: data,
            }),
        }),
    }),
});

export const {
    useGetReportQuery,
    // useGetCallingStatisticsQuery,
    useGetFilterQuery,
    useSaveFilterMutation,
} = reportAPI;
