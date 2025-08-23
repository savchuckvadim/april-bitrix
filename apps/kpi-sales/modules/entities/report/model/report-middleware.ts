// import { AnyAction, Middleware } from '@reduxjs/toolkit';
// import { AppDispatch, RootState } from "@/modules/app/model/store";
// import { getReportData } from './report-thunks';
// import { departmentActions } from "@/modules/entities/departament/model/departament-slice";

// export const reportMiddleware: Middleware<{}, RootState> = store => next => (action:AnyAction) => {
//     const result = next(action);

//     // Check if department was updated
//     if (action.type === departmentActions.setFetchedDepartment.type) {
//         const state = store.getState();
//         const reportState = state.report;

//         // Only initialize report if it hasn't been initialized yet
//         if (!reportState.isInitialized) {
//             (store.dispatch as AppDispatch)(getReportData());
//         }
//     }

//     return result;
// };
