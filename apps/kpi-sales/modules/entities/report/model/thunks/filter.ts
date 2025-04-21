// import { reportAC } from "../report-reducer";
// import { Filter, FilterInnerCode } from "@/types/report/report-type";
// import { saveFilterToServer } from "./utils";
// import { BitrixUser } from "@/types/report/report-type";
// import { AppDispatchType } from "@/redux/store";
// import { GetStateType } from "./types";
// import { ReportStateType } from "../report-reducer";

// export const setCurrentActions = (actionCode: FilterInnerCode) =>
//     async (dispatch: AppDispatchType, getState: GetStateType) => {
//         const report = getState().report as ReportStateType;
//         const actions = report.actions;
//         const items = actions.items;
//         const current = actions.current;

//         const searchingActionInCurrent = current.find((action: Filter) => action.innerCode === actionCode);
//         let updtCurrent = [...actions.current] as Array<Filter>;

//         if (searchingActionInCurrent) {
//             updtCurrent = updtCurrent.filter((action: Filter) => action.innerCode !== actionCode);
//         } else {
//             const addingUser = items.find((action: Filter) => action.innerCode === actionCode);
//             if (addingUser) {
//                 updtCurrent.push(addingUser);
//             }
//         }

//         dispatch(reportAC.setCurrentFilter(actionCode));
//         dispatch(reportAC.setCurrentActions(updtCurrent));
//     };

// export const saveFilter = () => async (dispatch: AppDispatchType, getState: GetStateType) => {
//     const state = getState();
//     const report = state.report as ReportStateType;
//     const isLoading = report.isFilterLoading;

//     if (!isLoading) {
//         dispatch(reportAC.setFilterLoadingStatus(true));
//         const domain = state.app.domain;
//         const userId = state.app.currentUser.ID;
//         const filter = report.filter;
//         const dates = {
//             from: report.date.from,
//             to: report.date.to
//         };
//         const department = state.departament.current.map((user: BitrixUser) => user.ID);

//         await saveFilterToServer(domain, userId, filter, dates, department);
//         dispatch(reportAC.setFilterLoadingStatus(false));
//     }
// }; 