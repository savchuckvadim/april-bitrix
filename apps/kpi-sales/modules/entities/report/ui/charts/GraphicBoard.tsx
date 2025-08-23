import React from "react";
import { useAppSelector } from "@/modules/app/lib/hooks/redux";
import KPIChart from "./KPIChart";
import { ReportData } from "../../model/types/report/report-type";

interface GraphicBoardeProps {
  report: ReportData[];
}

const GraphicBoard: React.FC<GraphicBoardeProps> = ({ report }) => {
  // const isLoading = useAppSelector(state => state.report.isLoading);
  // const isFetched = useAppSelector(state => state.report.isFetched);

  if (!report || !report.length || !report[0]?.kpi) {
    return null;
  }

  return (
    <div className="space-y-4">
      <KPIChart report={report} />
    </div>
  );
};

export default GraphicBoard;
