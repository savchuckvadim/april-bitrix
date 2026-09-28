'use client';

import { MicroSegmented } from '@workspace/april-ui';
import { ReportBlockWrapper } from '@/modules/entities/report';
import {
    ReportGroupTabs,
    type StructureSection,
} from '@/modules/feature/report-tabs';
import { useAiSectionsMatrix } from '../hooks/use-ai-sections-matrix';
import { AI_MATRIX_EMPTY_TEXT } from '../lib/ai-types-matrix-view.util';
import { AiQueuedState } from './components/AiQueuedState';
import { AiTheoryLink } from './components/AiTheoryLink';
import { AiMatrixTable } from './components/AiMatrixTable';
import { AiMatrixRatingFooter } from './components/AiMatrixRatingFooter';

const BLOCK_LABEL = 'AI: разделы';
const SCORE_STORAGE_PREFIX = 'ai-sections-matrix-score';

/**
 * Блок «AI: разделы оценки по типу»: переключатель типа
 * (типы со звонками за период), менеджеры × разделы рубрики типа
 * (оценённых звонков, подстрока — средняя раздела) и сводная колонка
 * «Все разборы» (разборов + оценка типа); вкладки Сводный / По отделам /
 * По группам с рейтингами по счётчикам и по оценке; CSV с колонками оценок.
 */
export const AiSectionsMatrixBlock = () => {
    const matrix = useAiSectionsMatrix();

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
            blockId="ai-sections-matrix"
            title="AI: разделы оценки по типу"
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
                    <MicroSegmented
                        ariaLabel="Тип звонка"
                        size="xs"
                        options={matrix.options}
                        value={matrix.callType ?? undefined}
                        onChange={matrix.selectType}
                    />
                    <ReportGroupTabs
                        presentUserIds={matrix.presentUserIds}
                        renderSummary={() => (
                            <AiMatrixTable matrix={matrix.summaryTable} />
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
