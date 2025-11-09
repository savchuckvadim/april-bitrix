'use client'
import React from 'react';
import { useReport } from '../model';

import Filter from './Filter';

import KPIReportTable from './Tables/KPIReportTable';
import { KPIReportTotalTable } from './Tables/KPIReportTotalTable';
import Graphics from './Graphics';
import { KPIReportTotalChart } from './charts/KPIReportTotalChart';
import { KPISingleActionChart } from './charts/KPISingleActionChart';
import { ReportBlockWrapper } from './components/ReportBlockWrapper';

import { exportTableToCSV } from '../lib/export-util';
import { getReportTableData } from '../lib/ui-util';
import { getMergedReportsData } from '@/modules/feature/merged-kpi-calling-report/lib/merge-reports.util';
import { getCallingStatisticsTableData } from '@/modules/entities/calling-statistics/lib/ui-util';

import { Processing } from '@/modules/shared';
import ReportHeader from './ReportHeader/ReportHeader';
import { CallingStatistics, ReportCallingData } from '../../calling-statistics';
import NoreportData from './components/NoreportData';
import { useCallingStatistics } from '../../calling-statistics/lib/hooks/useCallingStatistics';
import { MergedReportTable } from '@/modules/feature/merged-kpi-calling-report';
import { MergedSingleActionChart } from '@/modules/feature/merged-kpi-calling-report/ui/MergedSingleActionChart';
import { ReportType } from '@/modules/feature';
import { useReportType } from '@/modules/feature/report-widget-type';
import { EReportType } from '@/modules/feature/report-widget-type/consts/report-type.consts';


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

    const { current: currentReportType } = useReportType();


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
                                    <div className="mb-4 flex justify-between items-center w-full h-10  rounded-md p-0">

                                        <ReportType />
                                    </div>
                                    {/* <div className="mb-4 flex justify-end">
                                        <ExportAllBlocksButton
                                            report={report}
                                            callingsReport={callingsReport as ReportCallingData[]}
                                        />
                                    </div> */}
                                    {/* kpi report event by managers */}
                                    {(currentReportType === EReportType.EVENTS || currentReportType === EReportType.All) && <ReportBlockWrapper
                                        blockId="kpi-report"
                                        title="KPI отчет по менеджерам (таблица)"
                                        onDownload={() => {
                                            const tableData = getReportTableData(report);
                                            exportTableToCSV(tableData, 'kpi-report-managers.csv');
                                        }}
                                    >
                                        <KPIReportTable report={report} />
                                        <div className="mt-3">
                                            <Graphics report={report} />
                                        </div>
                                        <KPIReportTotalTable report={report} />
                                        <KPIReportTotalChart report={report} />
                                        <div className="mt-3">
                                            <KPISingleActionChart report={report} />
                                        </div>
                                    </ReportBlockWrapper>
                                    }


                                    {/* {(currentReportType === EReportType.CALLINGS || currentReportType === EReportType.All) && <ReportBlockWrapper
                                        blockId="kpi-report-total-table"
                                        title="KPI общие показатели (таблица)"
                                        onDownload={() => {
                                            const tableData = getReportTableData(report);
                                            // Создаем таблицу с итогами
                                            const totalData = {
                                                code: 'total',
                                                firstCellName: 'Показатель',
                                                data: [{
                                                    name: 'Итого',
                                                    actions: tableData.data[0]?.actions.map(action => {
                                                        const total = tableData.data.reduce((sum, user) => {
                                                            const userAction = user.actions.find(a => a.name === action.name);
                                                            return sum + (userAction?.value || 0);
                                                        }, 0);
                                                        return { name: action.name, value: total };
                                                    }) || []
                                                }]
                                            };
                                            exportTableToCSV(totalData, 'kpi-report-total.csv');
                                        }}
                                    >
                                        <KPIReportTotalTable report={report} />
                                        <KPIReportTotalChart report={report} />
                                    </ReportBlockWrapper>
                                    } */}

                                    {/*calling statistics*/}
                                    {(currentReportType === EReportType.CALLINGS || currentReportType === EReportType.All) && <ReportBlockWrapper
                                        blockId="calling-statistics"
                                        title="Статистика звонков"
                                        onDownload={() => {
                                            if (callingsReport && callingsReport.length > 0) {
                                                const tableData = getCallingStatisticsTableData(callingsReport);
                                                exportTableToCSV(tableData, 'calling-statistics.csv');
                                            }
                                        }}
                                    >
                                        <CallingStatistics
                                            callingsReport={callingsReport}
                                            isLoading={isCallingLoading}
                                        />
                                    </ReportBlockWrapper>
                                    }

                                    {/*merged report*/}
                                    {(currentReportType === EReportType.MERGED || currentReportType === EReportType.All) && report && callingsReport && <ReportBlockWrapper
                                        blockId="merged-report"
                                        title="Объединенный отчет KPI и звонков"
                                        onDownload={() => {
                                            if (report && callingsReport) {
                                                const tableKpiData = getReportTableData(report);
                                                const tableCallingsData = getCallingStatisticsTableData(callingsReport);
                                                const mergedData = getMergedReportsData(tableKpiData, tableCallingsData);
                                                exportTableToCSV(mergedData, 'merged-report.csv');
                                            }
                                        }}
                                    >
                                        <MergedReportTable report={report} callingsReport={callingsReport as ReportCallingData[]} />
                                        <div className="mt-3">
                                            <MergedSingleActionChart
                                                report={report}
                                                callingsReport={callingsReport as ReportCallingData[]}
                                            />
                                        </div>
                                    </ReportBlockWrapper>
                                    }
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
