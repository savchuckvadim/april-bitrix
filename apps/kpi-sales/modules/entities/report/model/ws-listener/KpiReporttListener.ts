"use client";

import { reportActions, ReportState } from "..";

import {
  Filter,
  FilterInnerCode,
  IFilterResponse,
  ReportData,
} from "../types/report/report-type";
import { AppDispatch } from "@/modules/app/model/store";
import { ReportRequest } from "../report-service";
import { getReportDataAPI } from "../../lib/helpers";
import { callingStatisticsApi } from "@/modules/entities/calling-statistics";
import { socket } from "@/modules/app/model/AppThunk";

// или wss://api.myapp.ru

socket?.on("connect", () => {
  console.log("✅ Socket connected:", socket?.id);
});

// // ловим ошибки
socket?.on("connect_error", (err) => {
  console.error("❌ Socket connection error:", err);
});

export async function kpiReportListenerHelper(
  dispatch: AppDispatch,
  reportData: ReportRequest,
  report: ReportState,
  savedFilter: FilterInnerCode[] | undefined,
) {
  reportData.socketId = socket?.id;
  const reportQueueResponse = await getReportDataAPI(reportData);
  dispatch(
    callingStatisticsApi.endpoints.getCallingStatistics.initiate(reportData, {
      forceRefetch: true,
    }),
  );

  const handler = (data: ReportData[]) => {
    const reportResponse = data;

    if (reportResponse) {
      dispatch(
        reportActions.setFetchedReport({
          report: reportResponse,
          // dateFrom: date.from,
          // dateTo: date.to,
          dateFieldId: reportData.filters.dateFieldId,
          actionFieldId: reportData.filters.actionFieldId,
          // userFieldId,
        }),
      );

      if (reportResponse.length) {
        const stateFilter =
          report.filter && report.filter.length > 0 ? report.filter : null;
        const rememberFilter =
          savedFilter && savedFilter.length > 0 ? savedFilter : null;

        const filter = reportResponse[0]?.kpi.map(
          (kpiItem) => kpiItem.action,
        ) as Array<Filter>;
        const currentFilter = stateFilter || rememberFilter;

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
    }

    dispatch(reportActions.setLoadingReportStatus(false));

    socket?.off("kpi-report:done", handler); // отписка// отписка
  };
  socket?.on("kpi-report:done", (data: ReportData[]) => {
    console.log(socket);
    console.log("ответ ws по событию kpi-report:done");

    handler(data);
  });
}
