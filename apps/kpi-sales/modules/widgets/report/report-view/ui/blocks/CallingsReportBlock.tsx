'use client';
import {
    ReportBlockWrapper,
    exportTableToCSV,
} from '@/modules/entities/report';
import {
    CallingStatistics,
    CallingTable,
    getCallingStatisticsTableData,
    useCallingStatistics,
} from '@/modules/entities/calling-statistics';
import { ReportGroupTabs } from '@/modules/feature/report-tabs';
import {
    buildCallingRatingDataset,
    callingRowUserId,
} from '@/modules/feature/report-rating';
import { ConversionTableSettings } from '@/modules/feature/report-conversions/ui/ConversionTableSettings';
import { useTableConversionAnnotations } from '@/modules/feature/report-conversions/hooks/use-conversions.hook';
import { usePlanAnnotations } from '@/modules/feature/plans';
import { RatingFooter } from './RatingFooter';

/**
 * Статистика фактических звонков: вкладки разбивки с рейтингами.
 * wrapped — в сворачиваемом блоке с CSV-экспортом (режим «Все отчеты»).
 */
export const CallingsReportBlock = ({
    wrapped = false,
}: {
    wrapped?: boolean;
}) => {
    const { isLoading, data: callingsReport } = useCallingStatistics();
    const annotations = useTableConversionAnnotations('callings');
    const ratingDataset = buildCallingRatingDataset(callingsReport ?? []);
    // У звонков id лежит в user.ID (callingRowUserId), не в userId!
    const presentUserIds = (callingsReport ?? []).map(callingRowUserId);
    // План-аннотации по звонковым показателям (бакеты >30с/>60с).
    const planAnnotations = usePlanAnnotations(['calling'], presentUserIds);

    const renderSummary = () => (
        <>
            <ConversionTableSettings scope="callings" />
            <CallingStatistics
                callingsReport={callingsReport}
                isLoading={isLoading}
                annotations={annotations}
                planAnnotations={planAnnotations}
            />
        </>
    );

    // Секция звонков — только таблица (дашборд остаётся в «Сводном»).
    const renderSection = (userIds: Set<number>) => {
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
        return (
            <CallingTable
                data={sectionCallings}
                annotations={annotations}
                planAnnotations={planAnnotations}
            />
        );
    };

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
            renderDepartmentsFooter={renderRating('отделы (звонки)')}
            renderGroupsFooter={renderRating('группы (звонки)')}
        />
    );

    if (!wrapped) return tabs;

    return (
        <ReportBlockWrapper
            blockId="calling-statistics"
            title="Статистика фактических звонков"
            onDownload={() => {
                if (callingsReport && callingsReport.length > 0) {
                    exportTableToCSV(
                        getCallingStatisticsTableData(callingsReport),
                        'calling-statistics.csv',
                    );
                }
            }}
        >
            {tabs}
        </ReportBlockWrapper>
    );
};
