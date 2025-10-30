import { AppDispatch, RootState, ThunkExtraArgument } from '@/modules/app/model/store';

import {
    ReportDateType,
    // Filter,
    // FilterInnerCode,
    IFilterResponse,
    // IDepartmentResponse,
    EReportDateMode,
} from '../types/report/report-type';
import { ReportRequest } from '../report-service';


import { reportDateRequestFlow } from '../../lib/date-util';
import { logClient } from '@/modules/app/lib/helper/logClient';

import { BxDepartmentRequestDtoDomain } from '@workspace/nest-api/';
import { BXUserDto, OrkKpiFilter, OrkKpiFilterInnerCode, ReportGetFiltersDto } from '@workspace/nest-api';
import { IBXUser } from '@workspace/bitrix/src/domain/interfaces/bitrix.interface';
import { reportActions } from '..';
import { getDepartamentIds, getDepartmentByDomain, getReportInitDepartment, prepareDepartmentResponse } from '@/modules/entities/departament/lib/department-util';
import { departmentActions } from '@/modules/entities/departament';
import { getReportDataAPI } from '../../lib/helpers';
import { getCallingStatistics } from '@/modules/entities/calling-statistics';
import { getCommunicationsReport } from '@/modules/entities/communications-report/lib/communications.helper';
import { getUserReport } from '@/modules/entities/user-report/lib/user-report.helper';
import { getUserReportThunk } from '@/modules/entities/user-report';

export const getReportData =
    () => async (dispatch: AppDispatch, getState: () => RootState, { getWSClient }: ThunkExtraArgument) => {
        dispatch(reportActions.setLoadingReportStatus(true));
        const state = getState();
        const domain = state.app.domain;
        const currentUser = state.app.bitrix.user;
        const currentUserId = currentUser?.ID;
        console.log('currentUserId', currentUserId);
        console.log('domain', domain);


        if (currentUserId) {
            const stDepartament = state.department;
            const stateDepartament = stDepartament.current;
            let departament: IBXUser[] | null = null;
            const report = state.report;
            const savedFilterData = null;
            // const savedFilterData = (await getFilter(
            //     domain,
            //     currentUserId,
            // )) as null | IFilterResponse;
            const savedFilter = null;
            // const savedFilter = savedFilterData?.filter;
            let isHeadManager = true;

            if (stateDepartament.length) {
                departament = stateDepartament;
            } else {
                const filtredDepartmentIds = null
                //savedFilterData?.department as
                // | string[]
                // | null;

                const departamentResponse = await getDepartmentByDomain(domain as BxDepartmentRequestDtoDomain);
                if (!departamentResponse) {
                    return;
                }
                const departmentResult = prepareDepartmentResponse(currentUser, departamentResponse, filtredDepartmentIds);

                const { users, groups, currentGroups, currentGroup } = departmentResult;


                isHeadManager = departmentResult.isHeadManager;

                departament = departmentResult.departament;

                if (departament) {
                    dispatch(
                        departmentActions.setFetchedDepartment({
                            departament,
                            currentUsers: users,
                            groups,
                            currentGroups,
                            isHeadManager,
                        }),
                    );
                }
                departament = getReportInitDepartment(departament, filtredDepartmentIds, isHeadManager, currentGroup, users);

            }

            const departamentIds: number[] = getDepartamentIds(departament);

            let userFieldId = '';
            let actionFieldId = '';
            let currentActions = {};
            let dateFieldId = '';

            const isFirstLoad = !report.isFetched;
            const date = report.date;

            const { from, to } = reportDateRequestFlow(
                dispatch,
                isFirstLoad,
                savedFilterData,
                date,
            );

            const reportData = {
                domain,
                filters: {
                    dateFrom: from,
                    dateTo: to,
                    userIds: departamentIds.map(id => id.toString()),
                    departament: departament as unknown as BXUserDto[],
                    userFieldId,
                    dateFieldId,
                    actionFieldId,
                    currentActions,
                } as ReportGetFiltersDto,
            } as ReportRequest;

            const reportResponse = await getReportDataAPI(reportData);
            // const testCommunicationsReport = await getCommunicationsReport(domain, from, to, departament as IBXUser[] as BXUserDto[], 'socketId');



            // kpiReportListenerHelper(dispatch, reportData, report, savedFilter)
            const statisticsData = { ...reportData };
            // dispatch(callingStatisticsApi.endpoints.getCallingStatistics.initiate(statisticsData,
            //     {
            //         forceRefetch: true,
            //     }
            // ));
            dispatch(getCallingStatistics(statisticsData));
            if (reportResponse) {
                dispatch(
                    reportActions.setFetchedReport({
                        report: reportResponse,
                        // dateFrom: date.from,
                        // dateTo: date.to,
                        dateFieldId,
                        actionFieldId,
                        // userFieldId,
                    }),
                );

                if (reportResponse.length) {
                    const stateFilter =
                        report.filter && report.filter.length > 0
                            ? report.filter
                            : null;
                    // const rememberFilter =
                    //     savedFilter && savedFilter.length > 0
                    //         ? savedFilter
                    //         : null;

                    const filter = reportResponse[0]?.kpi.map(
                        kpiItem => kpiItem.action,
                    ) || [];
                    // const currentFilter = stateFilter || rememberFilter;
                    const currentFilter = stateFilter
                    dispatch(
                        reportActions.setFetchedActions({
                            actions: filter,
                            currentFilter,
                        }),
                    );

                    dispatch(
                        reportActions.setFetchedFilter({
                            filter,
                            currentFilter,
                        }),
                    );
                }
            } else {
                logClient(
                    {
                        title: 'get report data: Report не получен по апи',
                        level: 'error',
                        context: 'getReportData',
                        message: 'fail report data',
                        domain: state.app.domain,
                        userId: state.app.bitrix.user?.ID,
                    },

                    {
                        reportData,
                        reportResponse,
                    },
                );
                // stack: errorInfo.componentStack,
            }
        }
        dispatch(reportActions.setLoadingReportStatus(false));
    };

export const changeDate =
    (typeOfDate: ReportDateType, date: string) =>
        async (dispatch: AppDispatch) => {
            dispatch(reportActions.setChangedDate({ typeOfDate, value: date }));
        };

export const setCurrentActions =
    (actionCode: OrkKpiFilterInnerCode) =>
        async (dispatch: AppDispatch, getState: () => RootState) => {
            const report = getState().report;
            const actions = report.actions;
            const items = actions.items;
            const current = actions.current;

            const searchingActionInCurrent = current.find(
                (action: OrkKpiFilter) => action.innerCode === actionCode,
            );
            let updtCurrent = [...actions.current];

            if (searchingActionInCurrent) {
                updtCurrent = updtCurrent.filter(
                    (action: OrkKpiFilter) => action.innerCode !== actionCode,
                );
            } else {
                const addingUser = items.find(
                    (action: OrkKpiFilter) => action.innerCode === actionCode,
                );
                if (addingUser) {
                    updtCurrent.push(addingUser);
                }
            }

            dispatch(reportActions.setCurrentFilter(actionCode));
            dispatch(reportActions.setCurrentActions(updtCurrent));
        };

export const saveFilter =
    () => async (dispatch: AppDispatch, getState: () => RootState) => {
        const state = getState();
        const isLoading = state.report.isFilterLoading;
        if (!isLoading) {
            dispatch(reportActions.setFilterLoadingStatus(true));
            const report = state.report;
            const domain = state.app.domain;
            const userId = state.app.bitrix.user?.ID;
            const filter = report.filter;
            const targetModes = [
                EReportDateMode.TODAY,
                EReportDateMode.WEEK,
                EReportDateMode.MONTH,
            ];
            const isMode =
                targetModes.includes(report.date.mode as EReportDateMode) ||
                targetModes.includes(report.date.mode as EReportDateMode);

            const dates = {
                [ReportDateType.FROM]: isMode
                    ? report.date.mode
                    : report.date[ReportDateType.FROM],
                [ReportDateType.TO]: isMode
                    ? report.date.mode
                    : report.date[ReportDateType.TO],
            };
            const department = state.department.current.map(
                (user: IBXUser) => user.ID,
            );

            const jsonFilter = JSON.stringify(filter, null, '  ');
            const jsonDates = JSON.stringify(dates, null, '  ');
            const jsonDepartment = JSON.stringify(department, null, '  ');

            await fetch('/api/proxy/save-filter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // 💥 обязательно
                },
                body: JSON.stringify({
                    domain,
                    userId,
                    filter: {
                        actions: jsonFilter,
                        dates: jsonDates,
                        department: jsonDepartment,
                    },
                }),
            });

            // const result = await response.json() as { result: IFilterResponse } | null;
            // console.log('save result')
            dispatch(reportActions.setFilterLoadingStatus(false));
        }
    };

export const getFilter = async (domain: string, userId: number) => {
    const response = await fetch('/api/proxy/filter', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json', // 💥 обязательно
        },
        body: JSON.stringify({ domain, userId }),
    });

    const filter = (await response.json()) as {
        result: IFilterResponse;
    } | null;
    return filter?.result || null;
};
