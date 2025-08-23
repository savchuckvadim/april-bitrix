import { API_METHOD } from "@workspace/api";
import { ReportData } from "../../report/model/types/report/report-type";
import { ReportCallingData } from "../type/calling-type";
import { callingStatisticsActions } from "./callingStatisticsSlice";
import { IHookData } from "@/app/api/proxy/hook/route";
import { AppDispatch, AppGetState } from "@/modules/app/model/store";
import { ReportRequest } from "../../report/model/report-service";
import { fetchCallingStatistics } from "../lib/helper";

export const getCallingStatistics =
  (reportData: ReportRequest) =>
  async (dispatch: AppDispatch, getState: AppGetState) => {
    const isLoading = getState().callingStatistics.isLoading;
    if (!isLoading) {
      dispatch(callingStatisticsActions.setLoading(true));

      const reportResponse: ReportCallingData[] | null =
        await fetchCallingStatistics(reportData);
      // try {
      //     const data = {
      //         url: 'full/report/callings',
      //         method: API_METHOD.POST,
      //         model: 'report',
      //         data: reportData
      //     } as IHookData
      //     const response = await fetch('/api/proxy/hook', {
      //         method: API_METHOD.POST,
      //         headers: {
      //             'Content-Type': 'application/json', // 💥 обязательно
      //         },
      //         body: JSON.stringify(data),
      //     });
      //     reportResponse = await response.json() as Array<ReportCallingData> | null
      // } catch (error) {
      //     console.error('❌ Proxy error:', error);
      // }
      dispatch(callingStatisticsActions.setFetched(reportResponse));
      dispatch(callingStatisticsActions.setLoading(false));
    }
  };
