'use client';

import { HintTooltip, MicroSegmented } from '@workspace/april-ui';
import { ReportBlockWrapper } from '@/modules/entities/report';
import {
    ReportGroupTabs,
    type StructureSection,
} from '@/modules/feature/report-tabs';
import { useAiSectionsMatrix } from '../hooks/use-ai-sections-matrix';
import { AI_MATRIX_BLOCK_TEXT } from '../lib/ai-matrix-texts';
import { aiMatrixNorms } from '../lib/ai-matrix-view.util';
import { AiQueuedState } from './components/AiQueuedState';
import { AiMatrixEmptyState } from './components/AiMatrixEmptyState';
import { AiMatrixLegend } from './components/AiMatrixLegend';
import { AiMatrixRatingFooter } from './components/AiMatrixRatingFooter';
import { AiMatrixSummary } from './components/AiMatrixSummary';
import { AiMatrixTable } from './components/AiMatrixTable';

const BLOCK_LABEL = 'AI: разделы';
const STORAGE_PREFIX = 'ai-sections-matrix-score';
const T = AI_MATRIX_BLOCK_TEXT;

/**
 * Блок «AI: разделы оценки по типу»: по умолчанию все типы сразу, тип —
 * фильтр; менеджеры × разделы по ходу разговора (средняя крупно,
 * оценённых мелко, цвет относительно «Итого по отделу») и колонка «Итог»;
 * легенда, профиль и рейтинги на «Сводном», вкладки По отделам / По
 * группам со своими итогами; CSV со средней и числом разборов.
 */
export const AiSectionsMatrixBlock = () => {
    const matrix = useAiSectionsMatrix();

    const renderFooter = (entityLabel: string, sections: StructureSection[]) => (
        <AiMatrixRatingFooter
            entityLabel={entityLabel}
            blockLabel={BLOCK_LABEL}
            sections={sections}
            dataset={matrix.countDataset}
            points={matrix.scorePoints}
            indicators={matrix.indicators}
            norms={aiMatrixNorms(matrix.summaryTable)}
            storagePrefix={STORAGE_PREFIX}
        />
    );

    const renderSection = (userIds: Set<number>) => {
        const table = matrix.buildTable(userIds);
        return (
            <AiMatrixTable
                matrix={table}
                totals={matrix.buildTotalsRow(table)}
                columnHints={matrix.columnHints}
                onColumnClick={matrix.openColumn}
            />
        );
    };

    return (
        <ReportBlockWrapper
            blockId="ai-sections-matrix"
            title={T.sections.title}
            onDownload={matrix.canDownload ? matrix.download : undefined}
        >
            <AiQueuedState
                status={matrix.section.status}
                jobStatus={matrix.section.jobStatus}
                error={matrix.section.error}
                loadingText={T.sections.loading}
                skeletonRows={5}
                onRetry={matrix.section.retry}
            />
            {matrix.isReady && matrix.isEmpty && (
                <AiMatrixEmptyState reason={matrix.coverage.reason} />
            )}
            {matrix.isReady && !matrix.isEmpty && (
                <div className="space-y-3">
                    <AiMatrixLegend legend={matrix.legend} />
                    <div className="flex flex-wrap items-center gap-2">
                        <HintTooltip title={T.sections.allTypes} lines={[T.sections.allTypesHint]}>
                            <span className="cursor-help text-xs text-muted-foreground">
                                {T.sections.typeFilter}:
                            </span>
                        </HintTooltip>
                        <MicroSegmented
                            ariaLabel={T.sections.typeFilter}
                            size="xs"
                            options={matrix.options}
                            value={matrix.callType ?? undefined}
                            onChange={matrix.selectType}
                        />
                    </div>
                    <ReportGroupTabs
                        presentUserIds={matrix.presentUserIds}
                        renderSummary={() => (
                            <AiMatrixSummary
                                matrix={matrix.summaryTable}
                                totalsRow={matrix.totalsRow}
                                columnHints={matrix.columnHints}
                                onColumnClick={matrix.openColumn}
                                hiddenManagers={matrix.hiddenManagers}
                                showHidden={matrix.showHidden}
                                onToggleHidden={matrix.toggleHidden}
                                profileColumnsLabel={T.chart.columns.sections}
                                indicators={matrix.indicators}
                                points={matrix.scorePoints}
                                countDataset={matrix.countDataset}
                                blockLabel={BLOCK_LABEL}
                                storagePrefix={STORAGE_PREFIX}
                            />
                        )}
                        renderSection={renderSection}
                        renderDepartmentsFooter={sections => renderFooter('отделы', sections)}
                        renderGroupsFooter={sections => renderFooter('группы', sections)}
                    />
                </div>
            )}
        </ReportBlockWrapper>
    );
};
