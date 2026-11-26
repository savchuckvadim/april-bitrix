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
import {
    buildKpiRatingDataset,
    labelRatingDataset,
} from '@/modules/feature/report-rating';
import { useIndicatorLabeler } from '@/modules/feature/portal-view';
import { ConversionTableSettings } from '@/modules/feature/report-conversions/ui/ConversionTableSettings';
import { useTableConversionAnnotations } from '@/modules/feature/report-conversions/hooks/use-conversions.hook';
import { usePlanAnnotations } from '@/modules/feature/plans';
import { ChartsGate, labelTableData } from '@/modules/shared';
import { RatingFooter } from './RatingFooter';

/**
 * KPI-отчёт по событиям: вкладки разбивки (сводный/отделы/группы) с
 * рейтингами-победителями. wrapped — в сворачиваемом блоке с CSV-экспортом
 * (режим «Все отчеты»). Свои названия показателей портала — в таблицах,
 * графиках, рейтингах и CSV (данные и выбор — по исходным).
 */
export const KpiReportBlock = ({ wrapped = false }: { wrapped?: boolean }) => {
    const { report } = useReport();
    const labelOf = useIndicatorLabeler();
    // Аннотации «% конверсии» для ячеек таблиц (undefined = выкл).
    const annotations = useTableConversionAnnotations('kpi');
    const ratingDataset = labelRatingDataset(
        buildKpiRatingDataset(report),
        labelOf,
    );
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
                labelOf={labelOf}
            />
            <ChartsGate>
                <div className="mt-3">
                    <Graphics report={report} labelOf={labelOf} />
                </div>
            </ChartsGate>
            <KPIReportTotalTable report={report} labelOf={labelOf} />
            <ChartsGate>
                <KPIReportTotalChart report={report} labelOf={labelOf} />
                <div className="mt-3">
                    <KPISingleActionChart report={report} labelOf={labelOf} />
                </div>
            </ChartsGate>
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
                    labelOf={labelOf}
                />
                <KPIReportTotalTable report={sectionReport} labelOf={labelOf} />
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
                managersWidget={
                    <KPISingleActionChart report={report} labelOf={labelOf} />
                }
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
                    labelTableData(getReportTableData(report), labelOf),
                    'kpi-report-managers.csv',
                );
            }}
        >
            {tabs}
        </ReportBlockWrapper>
    );
};
