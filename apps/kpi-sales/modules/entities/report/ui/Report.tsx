import React from "react";
import { useReport } from "../model";

import Filter from "./Filter";

import KPIReportTable from "./Tables/KPIReportTable";
import Graphics from "./Graphics";

import { Processing } from "@/modules/shared";
import ReportHeader from "./ReportHeader/ReportHeader";
import { CallingStatistics } from "../../calling-statistics";
import NoreportData from "./components/NoreportData";
import { useCallingStatistics } from "../../calling-statistics/lib/hooks/useCallingStatistics";
const Report = () => {
  const {
    report,
    isLoading,
    isFetched,
    isNoReportData,
    // handleUpdateReport,
  } = useReport();
  const { isLoading: isCallingLoading, data: callingsReport } =
    useCallingStatistics();

  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className=" p-7">
      {isLoading || !isFetched ? (
        <Processing />
      ) : (
        <>
          <ReportHeader
            isFilterOpen={isFilterOpen}
            setIsFilterOpen={setIsFilterOpen}
          />
          <Filter isOpen={isFilterOpen} />

          {isLoading && isFetched ? (
            <div className="flex justify-center items-center h-5/6 mt-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <>
              {!report || !report.length ? (
                <NoreportData />
              ) : (
                <div>
                  <KPIReportTable report={report} />
                  <div className="mt-3">
                    <Graphics report={report} />
                  </div>
                  <div>
                    <CallingStatistics
                      callingsReport={callingsReport}
                      isLoading={isCallingLoading}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Report;
