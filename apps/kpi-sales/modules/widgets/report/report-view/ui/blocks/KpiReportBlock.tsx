'use client';
import {
    useReport,
    KPIReportTable,
    KPIReportTotalTable,
    KPIReportTotalChart,
    KPISingleActionChart,
    Graphics,
    ReportBlockWrapper,
    exportTableToCSV,
    getReportTableData,
} from '@/modules/entities/report';
import { ReportGroupTabs } from '@/modules/feature/report-tabs';
import { buildKpiRatingDataset } from '@/modules/feature/report-rating';
import { ConversionTableSettings } from '@/modules/feature/report-conversions/ui/ConversionTableSettings';
import { useTableConversionAnnotations } from '@/modules/feature/report-conversions/hooks/use-conversions.hook';
import { usePlanAnnotations } from '@/modules/feature/plans';
import { RatingFooter } from './RatingFooter';

/**
 * KPI-отчёт по событиям: вкладки разбивки (сводный/отделы/группы) с
 * рейтингами-победителями. wrapped — в сворачиваемом блоке с CSV-экспортом
 * (режим «Все отчеты»).
 */
export const KpiReportBlock = ({ wrapped = false }: { wrapped?: boolean }) => {
    const { report } = useReport();
    // Аннотации «% конверсии» для ячеек таблиц (undefined = выкл).
    const annotations = useTableConversionAnnotations('kpi');
    const ratingDataset = buildKpiRatingDataset(report);
    // ID сотрудников в данных — для скрытия пустых секций разбивки.
    const presentUserIds = report.map(row => Number(row.user?.ID ?? row.id));
    // План-аннотации «⌖ план · %» (undefined — планы скрыты/не настроены).
    const planAnnotations = usePlanAnnotations(['kpi'], presentUserIds);

    const renderSummary = () => (
        <>
            <ConversionTableSettings scope="kpi" />
            <KPIReportTable
                report={report}
                annotations={annotations}
                planAnnotations={planAnnotations}
            />
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

    const renderSection = (userIds: Set<number>) => {
        const sectionReport = report.filter(row =>
            userIds.has(Number(row.user?.ID ?? row.id)),
        );
        return (
            <>
                <KPIReportTable
                    report={sectionReport}
                    annotations={annotations}
                    planAnnotations={planAnnotations}
                />
                <KPIReportTotalTable report={sectionReport} />
            </>
        );
    };

    const renderRating =
        (entityLabel: string) =>
        (sections: Parameters<typeof RatingFooter>[0]['sections']) => (
            <RatingFooter
                dataset={ratingDataset}
                entityLabel={entityLabel}
                sections={sections}
                managersWidget={<KPISingleActionChart report={report} />}
            />
        );

    const tabs = (
        <ReportGroupTabs
            presentUserIds={presentUserIds}
            renderSummary={renderSummary}
            renderSection={renderSection}
            renderDepartmentsFooter={renderRating('отделы')}
            renderGroupsFooter={renderRating('группы')}
        />
    );

    if (!wrapped) return tabs;

    return (
        <ReportBlockWrapper
            blockId="kpi-report"
            title="KPI отчет по событиям"
            onDownload={() => {
                exportTableToCSV(
                    getReportTableData(report),
                    'kpi-report-managers.csv',
                );
            }}
        >
            {tabs}
        </ReportBlockWrapper>
    );
};
