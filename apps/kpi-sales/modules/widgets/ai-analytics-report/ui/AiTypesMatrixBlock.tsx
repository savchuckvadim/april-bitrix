'use client';

import { ReportBlockWrapper } from '@/modules/entities/report';
import {
    ReportGroupTabs,
    type StructureSection,
} from '@/modules/feature/report-tabs';
import { useAiTypesMatrix } from '../hooks/use-ai-types-matrix';
import { AI_MATRIX_EMPTY_TEXT } from '../lib/ai-types-matrix-view.util';
import { AiQueuedState } from './components/AiQueuedState';
import { AiTheoryLink } from './components/AiTheoryLink';
import { AiTypesFilterChips } from './components/AiTypesFilterChips';
import { AiMatrixTable } from './components/AiMatrixTable';
import { AiMatrixRatingFooter } from './components/AiMatrixRatingFooter';
import { AiTypeTotalsList } from './components/AiTypeTotalsList';

const BLOCK_LABEL = 'AI: типы';
const SCORE_STORAGE_PREFIX = 'ai-types-matrix-score';

/**
 * Блок «AI: типы звонков» в стиле KPI-отчёта: менеджеры периода × типы
 * звонков (разборов, подстрока — оценка типа) + хвост продаж; вкладки
 * Сводный / По отделам / По группам с рейтингами-победителями по
 * счётчикам и по оценке; чипы-фильтр типов; CSV с колонками оценок.
 * Периметр — тот же, что у остальных секций вкладки (глобальный фильтр).
 */
export const AiTypesMatrixBlock = () => {
    const matrix = useAiTypesMatrix();

    const renderFooter = (
        entityLabel: string,
        sections: StructureSection[],
    ) => (
        <AiMatrixRatingFooter
            entityLabel={entityLabel}
            blockLabel={BLOCK_LABEL}
            sections={sections}
            dataset={matrix.countDataset}
            points={matrix.scorePoints}
            indicators={matrix.indicators}
            storagePrefix={SCORE_STORAGE_PREFIX}
        />
    );

    return (
        <ReportBlockWrapper
            blockId="ai-types-matrix"
            title="AI: типы звонков"
            onDownload={matrix.canDownload ? matrix.download : undefined}
        >
            <div className="mb-2 flex justify-end">
                <AiTheoryLink topic="kpiTables" />
            </div>
            <AiQueuedState
                status={matrix.section.status}
                jobStatus={matrix.section.jobStatus}
                error={matrix.section.error}
                loadingText="Считаем срез по типам…"
                skeletonRows={5}
                onRetry={matrix.section.retry}
            />
            {matrix.isReady && matrix.isEmpty && (
                <p className="py-2 text-xs text-muted-foreground">
                    {AI_MATRIX_EMPTY_TEXT}
                </p>
            )}
            {matrix.isReady && !matrix.isEmpty && (
                <div className="space-y-3">
                    <AiTypesFilterChips
                        chips={matrix.chips}
                        hiddenCount={matrix.hiddenCount}
                        onToggle={matrix.toggleType}
                        onShowAll={matrix.showAllTypes}
                    />
                    <ReportGroupTabs
                        presentUserIds={matrix.presentUserIds}
                        renderSummary={() => (
                            <>
                                <AiMatrixTable matrix={matrix.summaryTable} />
                                <AiTypeTotalsList
                                    totals={matrix.visibleTotals}
                                />
                            </>
                        )}
                        renderSection={userIds => (
                            <AiMatrixTable
                                matrix={matrix.buildTable(userIds)}
                            />
                        )}
                        renderDepartmentsFooter={sections =>
                            renderFooter('отделы', sections)
                        }
                        renderGroupsFooter={sections =>
                            renderFooter('группы', sections)
                        }
                    />
                </div>
            )}
        </ReportBlockWrapper>
    );
};
