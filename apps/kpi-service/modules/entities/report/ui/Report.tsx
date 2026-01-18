'use client';
import React, { useEffect, useState } from 'react';
import { useReport } from '../model';
import KPIReportTable from './Tables/KPIReportTable';
import Graphics from './Graphics';

import { CallingStatistics } from '../../calling-statistics';
import NoreportData from './components/NoreportData';
import { useCallingStatistics } from '../../calling-statistics/lib/hooks/useCallingStatistics';
export const dynamic = 'force-dynamic';


const Report = () => {
    const reportData = useReport();
    const { isLoading: isCallingLoading, data: callingsReport } =
        useCallingStatistics();


    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !reportData) {
        return null;
    }
    const {
        report,
        isLoading,
        isFetched,
        isNoReportData,
        // handleUpdateReport,
    } = reportData;
    return (
        <div className=" p-7">
            {/* {isLoading || !isFetched ? (
                <Processing />
            ) : ( */}
            <>
                {/* <ReportHeader
                        isFilterOpen={isFilterOpen}
                        setIsFilterOpen={setIsFilterOpen}
                    /> */}
                {/* <Filter  /> */}

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
            {/* )} */}


        </div>
    );
};

export default Report;
