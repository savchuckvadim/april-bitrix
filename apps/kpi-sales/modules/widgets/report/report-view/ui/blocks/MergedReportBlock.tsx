'use client';
import {
    useReport,
    ReportBlockWrapper,
    exportTableToCSV,
    getReportTableData,
} from '@/modules/entities/report';
import {
    ReportCallingData,
    getCallingStatisticsTableData,
    useCallingStatistics,
} from '@/modules/entities/calling-statistics';
import { ReportGroupTabs } from '@/modules/feature/report-tabs';
import {
    MergedReportTable,
    MergedSectionTable,
} from '@/modules/feature/merged-kpi-calling-report';
import { MergedSingleActionChart } from '@/modules/feature/merged-kpi-calling-report/ui/MergedSingleActionChart';
import { getMergedReportsData } from '@/modules/feature/merged-kpi-calling-report/lib/merge-reports.util';
import {
    applyMergedSelection,
    buildMergedRatingDataset,
    callingRowUserId,
} from '@/modules/feature/report-rating';
import { ConversionTableSettings } from '@/modules/feature/report-conversions/ui/ConversionTableSettings';
import { useTableConversionAnnotations } from '@/modules/feature/report-conversions/hooks/use-conversions.hook';
import { usePlanAnnotations } from '@/modules/feature/plans';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { RatingFooter } from './RatingFooter';

/**
 * Объединённый отчёт KPI + звонки: вкладки разбивки с рейтингами
 * (датасет дополнительно режется локальным фильтром таблицы из
 * mergedReport-слайса). wrapped — в сворачиваемом блоке с CSV-экспортом.
 */
export const MergedReportBlock = ({
    wrapped = false,
}: {
    wrapped?: boolean;
}) => {
    const { report } = useReport();
    const { data: callingsReport } = useCallingStatistics();
    const mergedSelection = useAppSelector(state => state.mergedReport);
    const annotations = useTableConversionAnnotations('merged');

    const ratingDataset = applyMergedSelection(
        buildMergedRatingDataset(report, callingsReport ?? []),
        mergedSelection,
    );
    const presentUserIds = report.map(row => Number(row.user?.ID ?? row.id));
    // План-аннотации: kpi + звонковые показатели (объединённая таблица).
    const planAnnotations = usePlanAnnotations(
        ['kpi', 'calling'],
        presentUserIds,
    );

    const renderSummary = () => (
        <>
            <ConversionTableSettings scope="merged" />
            <MergedReportTable
                report={report}
                callingsReport={callingsReport as ReportCallingData[]}
                annotations={annotations}
                planAnnotations={planAnnotations}
            />
            <div className="mt-3">
                <MergedSingleActionChart
                    report={report}
                    callingsReport={callingsReport as ReportCallingData[]}
                />
            </div>
        </>
    );

    // Секция merged — лёгкая таблица без своих фильтров.
    const renderSection = (userIds: Set<number>) => (
        <MergedSectionTable
            report={report.filter(row =>
                userIds.has(Number(row.user?.ID ?? row.id)),
            )}
            callingsReport={(callingsReport ?? []).filter(row =>
                userIds.has(callingRowUserId(row)),
            )}
            annotations={annotations}
            planAnnotations={planAnnotations}
        />
    );

    const renderRating =
        (entityLabel: string) =>
        (sections: Parameters<typeof RatingFooter>[0]['sections']) => (
            <RatingFooter
                dataset={ratingDataset}
                entityLabel={entityLabel}
                sections={sections}
            />
        );

    const tabs = (
        <ReportGroupTabs
            presentUserIds={presentUserIds}
            renderSummary={renderSummary}
            renderSection={renderSection}
            renderDepartmentsFooter={renderRating('отделы (объединённый)')}
            renderGroupsFooter={renderRating('группы (объединённый)')}
        />
    );

    if (!wrapped) {
        // Отдельная вкладка «Объединённый» ждёт оба датасета.
        if (!report || !callingsReport) return null;
        return tabs;
    }

    return (
        <ReportBlockWrapper
            blockId="merged-report"
            title="Объединенный отчет KPI и звонков"
            onDownload={() => {
                if (report && callingsReport) {
                    const mergedData = getMergedReportsData(
                        getReportTableData(report),
                        getCallingStatisticsTableData(callingsReport),
                    );
                    exportTableToCSV(mergedData, 'merged-report.csv');
                }
            }}
        >
            {tabs}
        </ReportBlockWrapper>
    );
};
