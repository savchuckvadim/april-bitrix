// import { reportAC, ReportStateType } from "../report-reducer";
// import { hookAPI } from "@/services/april-hook-api";
// import { getFilter } from "./utils";
// import { handleDepartmentData } from "./department";
// import { getCallingStatistics } from "./calling";
// import { addDays, format, parseISO } from "date-fns";
// import { AppDispatchType } from "@/redux/store";
// import { GetStateType } from "./types";
// import { ReportDateType, ReportDate } from "../report-type";

// export const getReportData = (filter = null) =>
//     async (dispatch: AppDispatchType, getState: GetStateType) => {
//         dispatch(reportAC.setLoadingReportStatus(true));
//         const state = getState();
//         const domain = state.app.domain;
//         const currentUser = state.app.currentUser;
//         const report = state.report as ReportStateType;

//         const savedFilterData = await getFilter(domain, currentUser?.ID);
//         const savedFilter = savedFilterData?.filter;

//         const { departament, departamentIds } = await handleDepartmentData(
//             dispatch,
//             getState,
//             savedFilterData,
//             currentUser
//         );

//         let userFieldId = '';
//         let actionFieldId = '';
//         let currentActions = {};
//         let dateFieldId = '';

//         const isFirstLoad = !report.isFetched;
//         if (isFirstLoad && savedFilterData && savedFilterData.dates) {
//             const dates = savedFilterData.dates as ReportDate;
//             dispatch(reportAC.setChangedDate(ReportDateType.FROM, dates.from));
//             dispatch(reportAC.setChangedDate(ReportDateType.TO, dates.to));
//         }

//         const date = isFirstLoad && savedFilterData && savedFilterData.dates
//             ? savedFilterData.dates as ReportDate
//             : report.date as ReportDate;

//         const parseDateFrom = parseISO(date.from);
//         const parseDateTo = parseISO(date.to);
//         const modifiedDateTo = addDays(parseDateTo, 1);

//         const dateFrom = format(parseDateFrom, "dd.MM.yyyy");
//         const dateTo = format(modifiedDateTo, "dd.MM.yyyy");

//         const reportData = {
//             domain,
//             filters: {
//                 dateFrom,
//                 dateTo,
//                 userIds: departamentIds,
//                 departament,
//                 userFieldId,
//                 dateFieldId,
//                 actionFieldId,
//                 currentActions
//             }
//         };

//         const reportResponse = await hookAPI.service('full/report/get', 'post', 'report', reportData);
//         dispatch(getCallingStatistics(reportData));

//         if (reportResponse) {
//             dispatch(reportAC.setFetchedReport(
//                 reportResponse,
//                 dateFieldId,
//                 actionFieldId,
//                 userFieldId,
//             ));

//             if (reportResponse.length) {
//                 const stateFilter = report.filter && report.filter.length > 0 ? report.filter : null;
//                 const rememberFilter = savedFilter && savedFilter.length > 0 ? savedFilter : null;
//                 const filter = reportResponse[0].kpi.map((kpiItem: any) => kpiItem.action) as Array<any>;
//                 const currentFilter = stateFilter || rememberFilter;

//                 dispatch(reportAC.setFetchedActions(filter, currentFilter));
//                 dispatch(reportAC.setFetchedFilter(filter, currentFilter));
//             }
//         }

//         dispatch(reportAC.setLoadingReportStatus(false));
//     };

// export const changeDate = (typeOfDate: ReportDateType, date: string) => async (dispatch: AppDispatchType) => {
//     dispatch(reportAC.setChangedDate(typeOfDate, date));
// }; 