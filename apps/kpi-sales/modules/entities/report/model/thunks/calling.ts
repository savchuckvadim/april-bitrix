// import { reportAC, ReportStateType } from "../report-reducer";
// import { hookAPI } from "@/services/april-hook-api";
// import { GetStateType, ReportDataParams } from "./types";
// import { AppDispatchType } from "@/redux/store";

// export const getCallingStatistics = (reportData: ReportDataParams) =>
//     async (dispatch: AppDispatchType, getState: GetStateType) => {
//     const isLoading = (getState().report as ReportStateType).calling.isLoading;

//     if (!isLoading) {
//         dispatch(reportAC.setIsLoadingCallings(true));
//         const reportResponse = await hookAPI.service(
//             'full/report/callings',
//             'post',
//             'report',
//             reportData
//         );
//         dispatch(reportAC.setFetchedCallings(reportResponse));
//         dispatch(reportAC.setIsLoadingCallings(false));
//     }
// };
