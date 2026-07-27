'use client';

import React, { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Settings2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { selectIsPublic } from '@/modules/app';
import { exportTableToCSV, ReportBlockWrapper } from '@/modules/entities/report';
import { ReportGroupTabs, StructureSection } from '@/modules/feature/report-tabs';
import { EntityRatingChart } from '@/modules/feature/report-rating';
import {
    buildConversionRatingDataset,
    buildConversionResult,
    ConversionChainEditor,
    ConversionFunnelChart,
    ConversionMethodSwitch,
    ConversionTable,
    conversionResultToTableData,
    conversionsActions,
    useConversionDataset,
    useConversionsComputation,
} from '@/modules/feature/report-conversions';
import type { ConversionScope } from '@/modules/feature/report-conversions';
import { ConversionsSummary } from './ConversionsSummary';
import { ConversionSectionRatingChart } from './ConversionSectionRatingChart';

export interface ConversionsBlockProps {
    scope: ConversionScope;
}

/**
 * Блок «Конверсии» внутри вкладок отчёта (Все/События/Звонки/Объединённый):
 * цепочка показателей + метод, сводная воронка и таблица, разбивка по
 * отделам/группам (таблица + воронка секции) и рейтинги-победители по шагам
 * конверсии. Заменяет бывшую отдельную вкладку «Конверсии».
 *
 * Композиция фич (report-tabs + report-rating + report-conversions) — на
 * widgets-слое, boundaries feature→feature не нарушаются. Конфиг —
 * state.conversions.widget[scope]; blockId прежний, персист показа блока
 * не слетает.
 */
export const ConversionsBlock: React.FC<ConversionsBlockProps> = ({
    scope,
}) => {
    const dispatch = useAppDispatch();
    const config = useAppSelector(state => state.conversions.widget[scope]);
    const isPublic = useAppSelector(selectIsPublic);
    const dataset = useConversionDataset(scope);
    const { result } = useConversionsComputation(
        dataset,
        config.codes,
        config.method,
    );
    const [settingsOpen, setSettingsOpen] = useState(false);

    if (!dataset.rows.length) return null;

    const conversionRatingDataset = buildConversionRatingDataset(result);

    const renderSection = (userIds: Set<number>) => {
        const sectionDataset = {
            actions: dataset.actions,
            rows: dataset.rows.filter(row => userIds.has(row.userId)),
        };
        const sectionResult = buildConversionResult(
            sectionDataset,
            config.codes,
            config.method,
        );
        if (!sectionResult.stepDefs.length || !sectionResult.rows.length) {
            return (
                <div className="py-2 text-sm text-muted-foreground">
                    Нет данных за период
                </div>
            );
        }
        return (
            <>
                <ConversionTable
                    result={sectionResult}
                    withChampions={false}
                    withLink={!isPublic}
                />
                <ConversionFunnelChart
                    dataset={sectionDataset}
                    codes={config.codes}
                    method={config.method}
                    title="Воронка"
                />
            </>
        );
    };

    const ratingFooter =
        (entityLabel: string) => (sections: StructureSection[]) => (
            <div className="mt-6 space-y-4">
                <ConversionSectionRatingChart
                    title={`Победители — ${entityLabel} (конверсия)`}
                    result={result}
                    sections={sections}
                />
                <EntityRatingChart
                    title="Победители — сотрудники (конверсия)"
                    dataset={conversionRatingDataset}
                />
            </div>
        );

    return (
        <ReportBlockWrapper
            blockId={`conversions-widget-${scope}`}
            title="Конверсии"
            // onDownload={() =>
            //     exportTableToCSV(
            //         conversionResultToTableData(result),
            //         'conversions.csv',
            //     )
            // }
        >
            <div className="mb-3 flex flex-wrap items-center gap-3">
                <ConversionMethodSwitch
                    method={config.method}
                    onChange={method =>
                        dispatch(
                            conversionsActions.setWidgetConfig({
                                scope,
                                patch: { method },
                            }),
                        )
                    }
                />
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => setSettingsOpen(open => !open)}
                >
                    <Settings2 className="mr-1 h-3 w-3" />
                    Показатели ({config.codes.length})
                </Button>
            </div>
            {settingsOpen && (
                <div className="mb-4 rounded-md border border-border bg-background-muted p-3">
                    <ConversionChainEditor
                        actions={dataset.actions}
                        codes={config.codes}
                        onChange={codes =>
                            dispatch(
                                conversionsActions.setWidgetConfig({
                                    scope,
                                    patch: { codes },
                                }),
                            )
                        }
                    />
                </div>
            )}
            {result.stepDefs.length ? (
                <ReportGroupTabs
                    presentUserIds={dataset.rows.map(row => row.userId)}
                    renderSummary={() => (
                        <ConversionsSummary dataset={dataset} config={config} />
                    )}
                    renderSection={renderSection}
                    renderDepartmentsFooter={ratingFooter('отделы')}
                    renderGroupsFooter={ratingFooter('группы')}
                />
            ) : (
                <p className="py-4 text-sm text-muted-foreground">
                    Выберите минимум два показателя, чтобы увидеть конверсии
                </p>
            )}
        </ReportBlockWrapper>
    );
};
