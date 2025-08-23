// import { InferActionsTypes } from "@/redux/store";
// import { Filter, FilterInnerCode, KPIAction, ReportCallingData, ReportData, ReportDetalization } from "@/types/report/report-type";
// import { format } from "date-fns";
// import { ReportDate, ReportDateType } from "./report-type";

// //TYPES
// type StateType = typeof initialState

// export type ReportStateType = StateType
// // type AuthThunkType = ThunkType<SetAuthUserDataType | ReturnType<typeof stopSubmit> | ReturnType<typeof inProgress>>
// type ReportActionsType = InferActionsTypes<typeof reportAC>

// const getInitialDate = () => {
//     // Текущая дата
//     const currentDate = new Date();

//     // Устанавливаем день месяца в 1, чтобы получить первый день текущего месяца
//     const firstDayOfMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

//     // Форматируем обе даты
//     const first = format(firstDayOfMonthDate, 'yyyy-MM-dd') as string;
//     const current = format(currentDate, 'yyyy-MM-dd') as string;
//     return {
//         first,
//         current
//     }

// }

// const initialState = {
//     data: null,
//     filter: [] as Array<FilterInnerCode>,
//     isFilterLoading: false as boolean,
//     actions: {
//         items: [] as Array<Filter>,
//         current: [] as Array<Filter>,
//     },
//     calling: {
//         items: null as ReportCallingData[] | null,
//         isFetched: false,
//         isLoading: false as boolean,
//     },
//     // items: [] as Array<ReportData>,
//     date: {
//         [ReportDateType.FROM]: getInitialDate().first as string,
//         [ReportDateType.TO]: getInitialDate().current as string,
//         inProcess: false as boolean,
//     } as ReportDate,
//     report: [] as Array<ReportData>,
//     detalization: {
//         report: null as ReportData | null,
//         action: null as KPIAction | null
//     } as ReportDetalization,
//     isFetched: false as boolean,
//     isLoading: false as boolean,
//     isInitialized: false as boolean,
// }

// //ACION CREATORS
// export const reportAC = {

//     activate: (status: boolean) =>
//         ({ type: 'report/SET_ACTIVATE_STATUS', status } as const),
//     setFetchedReport: (
//         report: Array<ReportData>,
//         // dateFrom: string,
//         // dateTo: string,
//         dateFieldId: string,
//         actionFieldId: string,
//         userFieldId: string,
//     ) =>
//     ({
//         type: 'report/SET_FITCHED_REPORT',
//         report,
//         // dateFrom,
//         // dateTo,

//         dateFieldId,
//         actionFieldId,
//         userFieldId,
//     } as const),
//     setUserReport: (
//         report: ReportData,

//     ) =>
//     ({
//         type: 'report/SET_USER_REPORT',
//         report,

//     } as const),

//     setFetchedFilter: (filter: Array<Filter>, currentFilter: Array<FilterInnerCode> | null) =>
//         ({ type: 'report/SET_FITCHED_FILTER', filter, currentFilter } as const),
//     setFilterLoadingStatus: (status: boolean) =>
//         ({ type: 'report/SET_FILTER_LOADING_STATUS', status } as const),
//     setCurrentFilter: (code: FilterInnerCode) =>
//         ({ type: 'report/SET_CURRENT_FILTER', code } as const),
//     // setFetchedDepartament: (departament: Array<BitrixUser>) =>
//     //     ({ type: 'report/SET_FITCHED_DEPARTAMENT', departament } as const),
//     setFetchedActions: (actions: Array<Filter>, currentFilter: Array<FilterInnerCode> | null) =>
//         ({ type: 'report/SET_FITCHED_ACTIONS', actions, currentFilter } as const),

//     setIsLoadingCallings: (status: boolean) =>
//         ({ type: 'report/SET_IS_LOADING_CALLINGS', status } as const),

//     setFetchedCallings: (callings: ReportCallingData[] | null) =>
//         ({ type: 'report/SET_FITCHED_CALLINGS', callings } as const),

//     setFetchedReportStatus: (status: boolean) =>
//         ({ type: 'report/SET_REPORT_FETCHED_STATUS', status } as const),
//     setLoadingReportStatus: (status: boolean) =>
//         ({ type: 'report/SET_REPORT_LOADING_STATUS', status } as const),

//     setChangedDate: (typeOfDate: ReportDateType, value: string) =>
//         ({ type: 'report/SET_CHANGED_DATE', typeOfDate, value } as const),
//     // setCurrentDate: (from: string, to: string) =>
//     //     ({ type: 'report/SET_CURRENT_DATE', from, to } as const),
//     setCurrentActions: (actions: Array<Filter>) =>
//         ({ type: 'report/SET_CURRENT_ACTIONS', actions } as const),
//     setActionDetalizationCurrent: (action: KPIAction) =>
//         ({ type: 'report/SET_DETALIZATION_ACTION_CURRENT', action } as const),
//     setReportDetalizationCurrent: (report: ReportData | null) =>
//         ({ type: 'report/SET_DETALIZATION_REPORT_CURRENT', report } as const),
// }

// const report = (state: StateType = initialState, action: ReportActionsType) => {

//     switch (action.type) {
//         case 'report/SET_FITCHED_FILTER':
//             const filter = action.currentFilter && action.currentFilter.length
//                 ? action.currentFilter
//                 : action.filter.map(f => f.innerCode)
//             return {
//                 ...state,
//                 filter
//             };
//         case 'report/SET_REPORT_LOADING_STATUS':
//             return {
//                 ...state,
//                 isLoading: action.status
//             }
//         case 'report/SET_FILTER_LOADING_STATUS':
//             return {
//                 ...state,
//                 isFilterLoading: action.status
//             }
//         case 'report/SET_CURRENT_FILTER':
//             const isNeedCut = state.filter.includes(action.code)
//             return {
//                 ...state,
//                 filter: isNeedCut ? state.filter.filter(f => f !== action.code) : [...state.filter, action.code]
//             };

//         case 'report/SET_FITCHED_ACTIONS':
//             const current = action.currentFilter && action.currentFilter.length
//                 ? action.actions.filter(act => action.currentFilter?.includes(act.innerCode))
//                 : action.actions
//             return {
//                 ...state,
//                 actions: {
//                     ...state.actions,
//                     items: action.actions,
//                     current,

//                 },
//                 detalization: {
//                     ...state.detalization,
//                     action: action.actions.length
//                         ? action.actions[0]
//                         : null
//                 }
//             };
//         case 'report/SET_DETALIZATION_ACTION_CURRENT':
//             return {
//                 ...state,
//                 detalization: {
//                     ...state.detalization,
//                     action: action.action
//                 }
//             };

//         case 'report/SET_DETALIZATION_REPORT_CURRENT':
//             return {
//                 ...state,
//                 detalization: {
//                     ...state.detalization,
//                     report: action.report
//                 }
//             };

//         case 'report/SET_FITCHED_REPORT':

//             return {
//                 ...state,
//                 report: action.report,
//                 // date: {
//                 //     ...state.date,
//                 //     from: action.dateFrom,
//                 //     to: action.dateTo,
//                 // },
//                 isFetched: true,
//                 isInitialized: true
//             };

//         case 'report/SET_USER_REPORT':

//             let isUpdated = false
//             const updatedReport = state.report.map(report => {

//                 if (report.user.ID == action.report.user.ID) {
//                     isUpdated = true
//                     return action.report
//                 } else {
//                     return report
//                 }
//             })

//             if (!isUpdated) {
//                 updatedReport.push(action.report)
//             }

//             return {
//                 ...state,
//                 report: updatedReport,

//             };

//         case 'report/SET_IS_LOADING_CALLINGS':
//             return {
//                 ...state,
//                 calling: {
//                     ...state.calling,
//                     isLoading: action.status,

//                 }
//             };

//         case 'report/SET_FITCHED_CALLINGS':
//             return {
//                 ...state,
//                 calling: {
//                     ...state.calling,
//                     items: action.callings,
//                     isFetched: true

//                 }
//             };
//         case 'report/SET_CHANGED_DATE':

//             // const isFetchedFromDateChange = state.date[`${action.typeOfDate}`] === action.value
//
//             return {
//                 ...state,
//                 date: {
//                     ...state.date,
//                     [`${action.typeOfDate}`]: action.value
//                 },
//                 // isFetched: isFetchedFromDateChange
//             };
//         // case 'report/SET_CURRENT_DATE':

//         //     // const isFetchedFromDateCurrent = state.date[ReportDateType.FROM] !== action.from || state.date[ReportDateType.TO] == action.to            // state.date[`${action.typeOfDate}`] === action.value
//         //
//         //     return {
//         //         ...state,
//         //         date: {
//         //             ...state.date,
//         //             [ReportDateType.FROM]: action.from,
//         //             [ReportDateType.TO]: action.to

//         //         },
//         //         // isFetched: !isFetchedFromDateCurrent
//         //     };
//         case 'report/SET_CURRENT_ACTIONS':

//             return {
//                 ...state,
//                 actions: {
//                     ...state.actions,
//                     current: action.actions,

//                 },

//             };
//         default:
//             return state;
//     }
// }

// export default report
