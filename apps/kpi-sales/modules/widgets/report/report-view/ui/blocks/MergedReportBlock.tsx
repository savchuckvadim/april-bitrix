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
    labelRatingDataset,
} from '@/modules/feature/report-rating';
import { useIndicatorLabeler } from '@/modules/feature/portal-view';
import { ConversionTableSettings } from '@/modules/feature/report-conversions/ui/ConversionTableSettings';
import { useTableConversionAnnotations } from '@/modules/feature/report-conversions/hooks/use-conversions.hook';
import { usePlanAnnotations, usePlanColumns } from '@/modules/feature/plans';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { ChartsGate, Preloader, labelTableData } from '@/modules/shared';
import { RatingFooter } from './RatingFooter';

/**
 * Объединённый отчёт KPI + звонки: вкладки разбивки с рейтингами
 * (датасет дополнительно режется выбором показателей таблицы из
 * mergedReport-слайса). wrapped — в сворачиваемом блоке с CSV-экспортом.
 *
 * Пока статистика звонков загружается, объединять не с чем (страницу
 * блокируют события, звонки идут следом) — вместо пустого блока
 * показывается индикатор загрузки.
 *
 * Свои названия показателей — только в выводе (рейтинги, CSV): состав и
 * выбор колонок объединённого отчёта — по исходным названиям.
 */
export const MergedReportBlock = ({
    wrapped = false,
}: {
    wrapped?: boolean;
}) => {
    const { report } = useReport();
    const {
        data: callingsReport,
        isLoading: isCallingsLoading,
        isFetched: isCallingsFetched,
    } = useCallingStatistics();
    const isCallingsPending = isCallingsLoading || !isCallingsFetched;
    const mergedSelection = useAppSelector(state => state.mergedReport);
    const annotations = useTableConversionAnnotations('merged');
    const labelOf = useIndicatorLabeler();

    // Выбор — по исходным названиям, свои названия — после него
    const ratingDataset = labelRatingDataset(
        applyMergedSelection(
            buildMergedRatingDataset(report, callingsReport ?? []),
            mergedSelection,
        ),
        labelOf,
    );
    // Состав объединённого отчёта — сотрудники и из событий, и из звонков
    // (иначе сотрудник только со звонками выпадает из вкладок отделов/групп).
    const presentUserIds = [
        ...new Set([
            ...report.map(row => Number(row.user?.ID ?? row.id)),
            ...(callingsReport ?? []).map(callingRowUserId),
        ]),
    ];
    // Колонки планов слева от факта (настройка портала «Объединённый»;
    // undefined — выключены): после отбора «Колонок» план уходит с фактом.
    const planColumns = usePlanColumns('merged', presentUserIds);
    // План-аннотации: kpi + звонковые показатели (объединённая таблица);
    // у показателя с колонкой плана — только «⌖ %».
    const planAnnotations = usePlanAnnotations(
        ['kpi', 'calling'],
        presentUserIds,
        planColumns?.planCodes,
    );

    const renderSummary = () => (
        <>
            <ConversionTableSettings scope="merged" />
            <MergedReportTable
                report={report}
                callingsReport={callingsReport as ReportCallingData[]}
                annotations={annotations}
                planAnnotations={planAnnotations}
                withPlanColumns={planColumns?.applyToRows}
                withPlanTotals={planColumns?.applyToTotals}
            />
            <ChartsGate>
                <div className="mt-3">
                    <MergedSingleActionChart
                        report={report}
                        callingsReport={callingsReport as ReportCallingData[]}
                    />
                </div>
            </ChartsGate>
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
            withPlanColumns={planColumns?.applyToRows}
            withPlanTotals={planColumns?.applyToTotals}
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

    const callingsLoading = (
        <div className="flex flex-col items-center gap-3 py-10 text-muted-foreground">
            <Preloader />
            <p className="text-sm">Загружаем статистику звонков…</p>
        </div>
    );

    if (!wrapped) {
        if (isCallingsPending) return callingsLoading;
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
                    exportTableToCSV(
                        labelTableData(mergedData, labelOf),
                        'merged-report.csv',
                    );
                }
            }}
        >
            {isCallingsPending ? callingsLoading : tabs}
        </ReportBlockWrapper>
    );
};
