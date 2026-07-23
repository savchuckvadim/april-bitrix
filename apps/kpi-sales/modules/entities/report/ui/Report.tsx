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
import { ReportGroupTabs, StructureSection } from '@/modules/feature/report-tabs';
import { EntityRatingChart } from '@/modules/feature/report-rating';
import {
    applyMergedSelection,
    buildCallingRatingDataset,
    buildKpiRatingDataset,
    buildMergedRatingDataset,
    callingRowUserId,
    RatingDataset,
} from '@/modules/feature/report-rating';
import { MergedSectionTable } from '@/modules/feature/merged-kpi-calling-report';
import CallingTable from '../../calling-statistics/ui/components/CallingTable';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { ReportData } from '../model/types/report/report-type';


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
    const mergedSelection = useAppSelector(state => state.mergedReport);


    const [isFilterOpen, setIsFilterOpen] = React.useState(false);
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    // ID сотрудников в данных — для скрытия пустых секций разбивки.
    // У звонков id лежит в user.ID (callingRowUserId), не в userId!
    const reportUserIds = report.map(row => Number(row.user?.ID ?? row.id));
    const callingUserIds = (callingsReport ?? []).map(callingRowUserId);

    // Датасеты рейтингов-победителей: события / звонки / объединённый
    // (merged дополнительно режется локальным фильтром таблицы).
    const kpiRatingDataset = buildKpiRatingDataset(report);
    const callingRatingDataset = buildCallingRatingDataset(
        callingsReport ?? [],
    );
    const mergedRatingDataset = applyMergedSelection(
        buildMergedRatingDataset(report, callingsReport ?? []),
        mergedSelection,
    );

    // Футер вкладки разбивки: рейтинг сущностей + рейтинг/виджет сотрудников.
    const ratingFooter =
        (
            dataset: RatingDataset,
            entityLabel: string,
            managersWidget?: React.ReactNode,
        ) =>
        (sections: StructureSection[]) => (
            <div className="mt-6 space-y-4">
                <EntityRatingChart
                    title={`Победители — ${entityLabel}`}
                    dataset={dataset}
                    sections={sections}
                />
                {managersWidget ?? (
                    <EntityRatingChart
                        title="Победители — сотрудники"
                        dataset={dataset}
                    />
                )}
            </div>
        );

    // Сводные блоки (как без разбивки) и компактные секции отдела/группы.
    const renderKpiSummary = () => (
        <>
            <KPIReportTable report={report} />
            <div className="mt-3">
                <Graphics report={report} />
            </div>
            <KPIReportTotalTable report={report} />
            <KPIReportTotalChart report={report} />
            <div className="mt-3">
                <KPISingleActionChart report={report} />
            </div>
        </>
    );
    const renderKpiSection = (userIds: Set<number>) => {
        const sectionReport = report.filter(row =>
            userIds.has(Number(row.user?.ID ?? row.id)),
        );
        return (
            <>
                <KPIReportTable report={sectionReport} />
                <KPIReportTotalTable report={sectionReport} />
            </>
        );
    };

    const renderCallingsSummary = () => (
        <CallingStatistics
            callingsReport={callingsReport}
            isLoading={isCallingLoading}
        />
    );
    // Секция звонков — только таблица (дашборд остаётся в «Сводном»).
    const renderCallingsSection = (userIds: Set<number>) => {
        const sectionCallings = (callingsReport ?? []).filter(row =>
            userIds.has(callingRowUserId(row)),
        );
        if (!sectionCallings.length) {
            return (
                <div className="py-2 text-sm text-muted-foreground">
                    Нет данных за период
                </div>
            );
        }
        return <CallingTable data={sectionCallings} />;
    };

    const renderMergedSummary = () => (
        <>
            <MergedReportTable
                report={report}
                callingsReport={callingsReport as ReportCallingData[]}
            />
            <div className="mt-3">
                <MergedSingleActionChart
                    report={report}
                    callingsReport={callingsReport as ReportCallingData[]}
                />
            </div>
        </>
    );
    // Рейтинги-победители в конце вкладок разбивки (по типам отчёта).
    const renderDepartmentsRating = ratingFooter(
        kpiRatingDataset,
        'отделы',
        <KPISingleActionChart report={report} />,
    );
    const renderGroupsRating = ratingFooter(
        kpiRatingDataset,
        'группы',
        <KPISingleActionChart report={report} />,
    );
    const renderCallingDepartmentsRating = ratingFooter(
        callingRatingDataset,
        'отделы (звонки)',
    );
    const renderCallingGroupsRating = ratingFooter(
        callingRatingDataset,
        'группы (звонки)',
    );
    const renderMergedDepartmentsRating = ratingFooter(
        mergedRatingDataset,
        'отделы (объединённый)',
    );
    const renderMergedGroupsRating = ratingFooter(
        mergedRatingDataset,
        'группы (объединённый)',
    );

    // Секция merged — лёгкая таблица без своих фильтров (учитывает
    // локальный фильтр объединённого отчёта из mergedReport-слайса).
    const renderMergedSection = (userIds: Set<number>) => (
        <MergedSectionTable
            report={report.filter(row =>
                userIds.has(Number(row.user?.ID ?? row.id)),
            )}
            callingsReport={(callingsReport ?? []).filter(row =>
                userIds.has(callingRowUserId(row)),
            )}
        />
    );

    return (
        // <div className=" p-7">
        //     {isLoading || !isFetched ? (
        //         <Processing />
        //     ) : (
        //         <>
        //             <div className="bg-background/50 backdrop-blur-sm fixed top-0 left-0 right-0 z-10 min-w-full">

        //                 <div className="flex justify-between items-center h-15 p-5 w-full">
        //                     <ReportHeader
        //                         isFilterOpen={isFilterOpen}
        //                         setIsFilterOpen={setIsFilterOpen}
        //                     />
        //                 </div>
        //                 <div className="px-15">
        //                     <Filter isOpen={isFilterOpen} />
        //                     {
        //                         isFilterOpen && <div className="h-screen w-screen "></div>
        //                     }
        //                 </div>

        //             </div>
        //             {isLoading && isFetched ? (
        //                 <div className="flex justify-center items-center h-5/6 mt-3">
        //                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        //                 </div>
        //             ) : (
        //                 <>
        //                     {!report || !report.length ? (
        //                         <NoreportData />
        //                     ) : (
        <div>
            <div className="mt-6 mb-4 flex justify-between items-center w-full h-10  rounded-md p-0">

                <ReportType />
            </div>
            {/* <div className="mb-4 flex justify-end">
                                        <ExportAllBlocksButton
                                            report={report}
                                            callingsReport={callingsReport as ReportCallingData[]}
                                        />
                                    </div> */}
            {/* kpi report event by managers */}
            {(currentReportType === EReportType.All) && <>
                <ReportBlockWrapper
                    blockId="kpi-report"
                    title="KPI отчет по событиям"
                    onDownload={() => {
                        const tableData = getReportTableData(report);
                        exportTableToCSV(tableData, 'kpi-report-managers.csv');
                    }}
                >
                    <ReportGroupTabs
                        presentUserIds={reportUserIds}
                        renderSummary={renderKpiSummary}
                        renderSection={renderKpiSection}
                        renderDepartmentsFooter={renderDepartmentsRating}
                        renderGroupsFooter={renderGroupsRating}
                    />
                </ReportBlockWrapper>


                <ReportBlockWrapper
                    blockId="calling-statistics"
                    title="Статистика фактических звонков"
                    onDownload={() => {
                        if (callingsReport && callingsReport.length > 0) {
                            const tableData = getCallingStatisticsTableData(callingsReport);
                            exportTableToCSV(tableData, 'calling-statistics.csv');
                        }
                    }}
                >
                    <ReportGroupTabs
                        presentUserIds={callingUserIds}
                        renderSummary={renderCallingsSummary}
                        renderSection={renderCallingsSection}
                        renderDepartmentsFooter={renderCallingDepartmentsRating}
                        renderGroupsFooter={renderCallingGroupsRating}
                    />
                </ReportBlockWrapper>


                <ReportBlockWrapper
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
                    <ReportGroupTabs
                        presentUserIds={reportUserIds}
                        renderSummary={renderMergedSummary}
                        renderSection={renderMergedSection}
                        renderDepartmentsFooter={renderMergedDepartmentsRating}
                        renderGroupsFooter={renderMergedGroupsRating}
                    />
                </ReportBlockWrapper>
            </>
            }
            {(currentReportType === EReportType.EVENTS) && <div>
                <ReportGroupTabs
                    presentUserIds={reportUserIds}
                    renderSummary={renderKpiSummary}
                    renderSection={renderKpiSection}
                    renderDepartmentsFooter={renderDepartmentsRating}
                    renderGroupsFooter={renderGroupsRating}
                />
            </div>
            }



            {/*calling statistics*/}
            {currentReportType === EReportType.CALLINGS && <div >
                <ReportGroupTabs
                    presentUserIds={callingUserIds}
                    renderSummary={renderCallingsSummary}
                    renderSection={renderCallingsSection}
                    renderDepartmentsFooter={renderCallingDepartmentsRating}
                    renderGroupsFooter={renderCallingGroupsRating}
                />
            </div>
            }

            {/*merged report*/}
            {currentReportType === EReportType.MERGED && report && callingsReport && <div >
                <ReportGroupTabs
                    presentUserIds={reportUserIds}
                    renderSummary={renderMergedSummary}
                    renderSection={renderMergedSection}
                    renderDepartmentsFooter={renderMergedDepartmentsRating}
                    renderGroupsFooter={renderMergedGroupsRating}
                />
            </div>
            }
        </div>
        //                     )}
        //                 </>
        //             )}
        //         </>
        //     )}
        // </div>
    );
};

export default Report;
