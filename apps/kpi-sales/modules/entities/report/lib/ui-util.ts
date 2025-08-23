import { RTableProps } from "../../../shared";
import { ReportData } from "../model/types/report/report-type";

export const getReportTableData = (report: ReportData[]): RTableProps => {
  const tableData: RTableProps = {
    code: `report`,
    firstCellName: "Менеджер",
    data: report.map((report) => ({
      name: report.userName || "Менеджер",
      actions: report.kpi.map((kpi) => ({
        name: kpi.action.name || "Unknown",
        value: kpi.count,
      })),
    })),
  };

  return tableData;
};
