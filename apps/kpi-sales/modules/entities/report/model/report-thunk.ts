// import { AppDispatch, AppGetState } from "@/modules/app/model/store";
// import { format, parseISO, addDays } from "date-fns";
// import { reportActions } from "./index";
// import { hookAPI } from "@/lib/api/hook";
// import { DepartmentState } from "@/modules/entities/departament/model/departament-slice";
// import { ReportState } from "./report-slice";
// import { ReportData } from "@/lib/api/report/types";
// import { DISPLAY_VALUES_FORM } from "@/lib/api/report/types";
// import { ReportDateType } from "@/lib/api/report/types";
// import { API_METHOD, onlineGeneralAPI } from "@workspace/api";

// export const initializeReport = () => async (dispatch: AppDispatch, getState: AppGetState) => {
//     try {
//         const state = getState();
//         const domain = state.app.domain;
//         const currentUser = state.app.currentUser;
//         const currentUserId = currentUser?.ID;

//         if (!domain || !currentUserId) {
//             throw new Error("Domain or user ID is missing");
//         }

//         // Get saved filters
//         const savedFilterData = await getFilter(domain, currentUserId);
//         const savedFilter = savedFilterData?.filter;

//         // Get department state
//         const departmentState = state.departament as DepartmentState;
//         const currentDepartment = departmentState.current;
//         const reportState = state.report as ReportState;

//         // If we have saved filters, apply them
//         if (savedFilterData?.dates) {
//             dispatch(reportActions.setChangedDate(ReportDateType.FROM, savedFilterData.dates[ReportDateType.FROM]));
//             dispatch(reportActions.setChangedDate(ReportDateType.TO, savedFilterData.dates[ReportDateType.TO]));
//         }

//         // Prepare dates
//         const date = savedFilterData?.dates || reportState.date;
//         const parseDateFrom = parseISO(date.from);
//         const parseDateTo = parseISO(date.to);
//         const modifiedDateTo = addDays(parseDateTo, 1);

//         const dateFrom = format(parseDateFrom, "dd.MM.yyyy");
//         const dateTo = format(modifiedDateTo, "dd.MM.yyyy");

//         // Prepare department IDs
//         const departmentIds = currentDepartment.map(user => user.ID);

//         // Prepare report data
//         const reportData = {
//             domain,
//             filters: {
//                 dateFrom,
//                 dateTo,
//                 userIds: departmentIds,
//                 departament: currentDepartment,
//                 userFieldId: '',
//                 dateFieldId: '',
//                 actionFieldId: '',
//                 currentActions: {} as DISPLAY_VALUES_FORM
//             }
//         };

//         // Fetch report data
//         const reportResponse = await hookAPI.service('full/report/get', 'post', 'report', reportData) as Array<ReportData>;

//         // Update report state
//         dispatch(reportActions.setFetchedReport(reportResponse));
//         dispatch(reportActions.setInitialized(true));

//     } catch (error) {
//         console.error("Failed to initialize report:", error);
//         dispatch(reportActions.setInitialized(false));
//     }
// };



// export const saveFilter = () => async (dispatch: AppDispatchType, getState: GetStateType) => {
//     //report/settings/filter

//     const state = getState()
//     const isLoading = (state.report as ReportStateType).isFilterLoading
//     if (!isLoading) {
//         dispatch(reportAC.setFilterLoadingStatus(true))
//         const report = state.report as ReportStateType
//         const domain = state.app.domain
//         const userId = state.app.currentUser.ID
//         const filter = report.filter
//         const dates = {
//             [ReportDateType.FROM]: report.date[ReportDateType.FROM],
//             [ReportDateType.TO]: report.date[ReportDateType.TO]

//         }
//         const department = state.departament.current.map(user => user.ID)
//
//         const jsonFilter = JSON.stringify(filter, null, '  ')
//         const jsonDates = JSON.stringify(dates, null, '  ')
//         const jsonDepartment = JSON.stringify(department, null, '  ')
//
//         const result = await onlineGeneralAPI.service(
//             'report/settings/filter',
//             API_METHOD.POST,
//             'filter',
//             {
//                 domain, userId, filter: {
//                     actions: jsonFilter,
//                     dates: jsonDates,
//                     department: jsonDepartment
//                 }
//             }


//         )
//         dispatch(reportAC.setFilterLoadingStatus(false))

//     }
//
// }

// //util
// interface IFilterResponse {
//     filter: Array<FilterInnerCode>,
//     department: Array<number> | null,
//     dates: {
//         [ReportDateType.FROM]: string,
//         [ReportDateType.TO]: string,
//     } | null
// }
// export const getFilter = async (domain: string, userId: number) => {
//     //report/settings/get/filter

//     let filter = await onlineGeneralAPI.service(
//         'report/settings/get/filter',
//         API_METHOD.POST,
//         'result',
//         { domain, userId }


//     ) as IFilterResponse | null
//
//     return filter

// }
