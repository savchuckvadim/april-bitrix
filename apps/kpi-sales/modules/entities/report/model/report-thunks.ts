import { AppDispatch, RootState } from '@/modules/app/model/store';
import { reportActions } from './report-slice';
import { ReportDateType, Filter, FilterInnerCode, IFilterResponse, IDepartmentResponse, EReportDateMode } from './types/report/report-type';
import { ReportRequest } from './report-service';
import { departmentActions } from '../../departament';
import { BXUser, BXDepartment } from "@workspace/bx";

import { API_METHOD, backAPI } from '@workspace/api/';
import { EBACK_ENDPOINT, EResultCode } from '@workspace/api';
import { getIsUserHead } from './report-util';
import { getReportDataAPI } from '../lib/helpers';
import { callingStatisticsApi } from '../../calling-statistics';
import { reportDateRequestFlow } from '../lib/date-util';
import { kpiReportListenerHelper } from './ws-listener/KpiReporttListener';
import { logClient } from '@/modules/app/lib/helper/logClient';


export const getReportData = () =>
    async (dispatch: AppDispatch, getState: () => RootState) => {
        dispatch(reportActions.setLoadingReportStatus(true));
        const state = getState();
        const domain = state.app.domain;
        const currentUser = state.app.bitrix.user;
        const currentUserId = currentUser?.ID;
        console.log('currentUserId', currentUserId)
        console.log('domain', domain)
        if (currentUserId) {


            const stDepartament = state.department;
            const stateDepartament = stDepartament.current;
            let departament: BXUser[] | null = null;
            const report = state.report;
            const savedFilterData = await getFilter(domain, currentUserId) as null | IFilterResponse;
            const savedFilter = savedFilterData?.filter;
            let isHeadManager = true;

            if (stateDepartament.length) {
                departament = stateDepartament;

            } else {
                const filtredDepartmentIds = savedFilterData?.department as string[] | null;
                const departamentData = { domain };
                // const departamentResponse = await hookAPI.service('full/department', API_METHOD.POST, 'department', departamentData);

                const response = await backAPI.service<{
                    department: IDepartmentResponse
                }>(
                    EBACK_ENDPOINT.DEPARTMENT,
                    API_METHOD.POST,
                    departamentData
                );

                if (response.resultCode === EResultCode.ERROR || !response.data) {
                    // const data = response.data; // автоматически типизировано как ReportData[]
                    // console.log(data);
                    return
                }

                const departamentResponse = response.data?.department







                isHeadManager = getIsUserHead(departamentResponse, currentUserId);

                if (isHeadManager) {
                    if (departamentResponse.allUsers) {
                        departament = departamentResponse.allUsers.filter((u: BXUser, index: number, self: BXUser[]) =>
                            index === self.findIndex((t: BXUser) => t.ID === u.ID)
                        );
                    }
                } else {
                    departament = [currentUser];
                }

                const groups = departamentResponse.childrenDepartments.filter((group: BXDepartment) => group.NAME.includes('Группа'));
                const currentGroup = groups.find((group: BXDepartment) => group.NAME.includes('Группа') && group.USERS?.find((user: BXUser) => user.ID == currentUserId));
                const currentGroups: BXDepartment[] = currentGroup ? [currentGroup] : !isHeadManager ? [] : groups;
                const users: BXUser[] = [];

                if (!filtredDepartmentIds || filtredDepartmentIds.length === 0) {
                    if (isHeadManager) {
                        currentGroups.map((group: BXDepartment) => group.USERS?.map((usr: BXUser) => {
                            if (!users.find((user: BXUser) => user.ID == usr.ID)) {
                                users.push(usr);
                            }
                        }));
                    } else {
                        users.push(currentUser);
                    }
                } else {
                    departament?.forEach((user: BXUser) => {
                        filtredDepartmentIds.forEach((stringId: string) => {
                            const id = Number(stringId);
                            if (Number(user.ID) == id) {
                                users.push(user);
                            }
                        });
                    });
                }

                if (departament) {
                    dispatch(departmentActions.setFetchedDepartment({

                        departament,
                        currentUsers: users,
                        groups,
                        currentGroups,
                        isHeadManager
                    }));

                }

                if (!filtredDepartmentIds || filtredDepartmentIds.length === 0) {
                    if (isHeadManager) {
                        if (currentGroup && currentGroup.USERS) {
                            departament = currentGroup.USERS;
                        }
                    }
                } else {
                    departament = users.map((user: BXUser) => user);
                }
            }

            const departamentIds: number[] = [];
            if (departament) {
                departament.map((user: BXUser) => departamentIds.push(user.ID));
            }

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
                date
            )
            const reportData = {
                domain,
                filters: {
                    dateFrom: from,
                    dateTo: to,
                    userIds: departamentIds,
                    departament,
                    userFieldId,
                    dateFieldId,
                    actionFieldId,
                    currentActions
                },

            } as ReportRequest;

            const reportResponse = await getReportDataAPI(reportData);

            // kpiReportListenerHelper(dispatch, reportData, report, savedFilter)

            dispatch(callingStatisticsApi.endpoints.getCallingStatistics.initiate(reportData,
                {
                    forceRefetch: true,
                }
            ));
            if (reportResponse) {
                dispatch(reportActions.setFetchedReport({
                    report: reportResponse,
                    // dateFrom: date.from,
                    // dateTo: date.to,
                    dateFieldId,
                    actionFieldId,
                    // userFieldId,
                }))

                if (reportResponse.length) {
                    const stateFilter = report.filter && report.filter.length > 0 ? report.filter : null
                    const rememberFilter = savedFilter && savedFilter.length > 0 ? savedFilter : null

                    const filter = reportResponse[0]?.kpi.map(kpiItem => kpiItem.action) as Array<Filter>
                    const currentFilter = stateFilter || rememberFilter

                    dispatch(reportActions.setFetchedActions({
                        actions: filter,
                        currentFilter
                    }))

                    dispatch(reportActions.setFetchedFilter({
                        filter,
                        currentFilter
                    }))
                }
            } else {
                logClient('get report data: Report не получен по апи', {
                    reportData,
                    reportResponse
                })
                // stack: errorInfo.componentStack,

            }

        }
        dispatch(reportActions.setLoadingReportStatus(false));
    };


export const changeDate = (typeOfDate: ReportDateType, date: string) => async (dispatch: AppDispatch) => {
    dispatch(reportActions.setChangedDate({ typeOfDate, value: date }));
};

export const setCurrentActions = (actionCode: FilterInnerCode) => async (dispatch: AppDispatch, getState: () => RootState) => {
    const report = getState().report;
    const actions = report.actions;
    const items = actions.items;
    const current = actions.current;

    const searchingActionInCurrent = current.find((action: Filter) => action.innerCode === actionCode);
    let updtCurrent = [...actions.current];

    if (searchingActionInCurrent) {
        updtCurrent = updtCurrent.filter((action: Filter) => action.innerCode !== actionCode);
    } else {
        const addingUser = items.find((action: Filter) => action.innerCode === actionCode);
        if (addingUser) {
            updtCurrent.push(addingUser);
        }
    }

    dispatch(reportActions.setCurrentFilter(actionCode));
    dispatch(reportActions.setCurrentActions(updtCurrent));
};

export const saveFilter = () => async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const isLoading = state.report.isFilterLoading;
    if (!isLoading) {
        dispatch(reportActions.setFilterLoadingStatus(true));
        const report = state.report;
        const domain = state.app.domain;
        const userId = state.app.bitrix.user?.ID;
        const filter = report.filter;
        const targetModes = [EReportDateMode.TODAY, EReportDateMode.WEEK, EReportDateMode.MONTH];
        const isMode = targetModes.includes(report.date.mode as EReportDateMode) ||
            targetModes.includes(report.date.mode as EReportDateMode)

        const dates = {
            [ReportDateType.FROM]: isMode ? report.date.mode : report.date[ReportDateType.FROM],
            [ReportDateType.TO]: isMode ? report.date.mode : report.date[ReportDateType.TO]
        };
        const department = state.department.current.map((user: BXUser) => user.ID);

        const jsonFilter = JSON.stringify(filter, null, '  ');
        const jsonDates = JSON.stringify(dates, null, '  ');
        const jsonDepartment = JSON.stringify(department, null, '  ');


        await fetch('/api/proxy/save-filter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // 💥 обязательно
            },
            body: JSON.stringify({
                domain, userId, filter: {
                    actions: jsonFilter,
                    dates: jsonDates,
                    department: jsonDepartment
                }
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

    const filter = await response.json() as { result: IFilterResponse } | null;
    return filter?.result || null;

}