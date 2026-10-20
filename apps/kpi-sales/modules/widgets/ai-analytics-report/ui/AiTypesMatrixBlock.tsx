'use client';

import { ReportBlockWrapper } from '@/modules/entities/report';
import {
    ReportGroupTabs,
    type StructureSection,
} from '@/modules/feature/report-tabs';
import { useAiTypesMatrix } from '../hooks/use-ai-types-matrix';
import { AI_MATRIX_BLOCK_TEXT } from '../lib/ai-matrix-texts';
import { aiMatrixNorms } from '../lib/ai-matrix-view.util';
import { AiQueuedState } from './components/AiQueuedState';
import { AiMatrixEmptyState } from './components/AiMatrixEmptyState';
import { AiMatrixLegend } from './components/AiMatrixLegend';
import { AiMatrixModeSwitch } from './components/AiMatrixModeSwitch';
import { AiMatrixRatingFooter } from './components/AiMatrixRatingFooter';
import { AiMatrixSummary } from './components/AiMatrixSummary';
import { AiMatrixTable } from './components/AiMatrixTable';
import { AiTypesFilterChips } from './components/AiTypesFilterChips';

const BLOCK_LABEL = 'AI: типы';
const STORAGE_PREFIX = 'ai-types-matrix-score';
const T = AI_MATRIX_BLOCK_TEXT;

/**
 * Блок «AI: типы звонков» в стиле KPI-отчёта: менеджеры периода × корзины
 * (Контакт / Презентация / Закрытие) или типы — оценка крупно, разборов
 * мелко, цвет относительно «Итого по отделу»; легенда, профиль и рейтинги
 * на «Сводном», вкладки По отделам / По группам со своими итогами; чипы
 * фильтра типов; CSV с оценкой и числом разборов. Пустое состояние —
 * причина и действие. Периметр — глобальный фильтр, как у вкладки.
 */
export const AiTypesMatrixBlock = () => {
    const matrix = useAiTypesMatrix();

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
            blockId="ai-types-matrix"
            title={T.types.title}
            onDownload={matrix.canDownload ? matrix.download : undefined}
        >
            <AiQueuedState
                status={matrix.section.status}
                jobStatus={matrix.section.jobStatus}
                error={matrix.section.error}
                loadingText={T.types.loading}
                skeletonRows={5}
                onRetry={matrix.section.retry}
            />
            {matrix.isReady && matrix.isEmpty && (
                <AiMatrixEmptyState reason={matrix.coverage.reason} />
            )}
            {matrix.isReady && !matrix.isEmpty && (
                <div className="space-y-3">
                    <AiMatrixLegend legend={matrix.legend} />
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <AiTypesFilterChips
                            chips={matrix.chips}
                            hiddenCount={matrix.hiddenCount}
                            onToggle={matrix.toggleType}
                            onShowAll={matrix.showAllTypes}
                            footnote={matrix.footnote}
                        />
                        <AiMatrixModeSwitch value={matrix.mode} onChange={matrix.setMode} />
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
                                profileColumnsLabel={T.chart.columns[matrix.mode]}
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
