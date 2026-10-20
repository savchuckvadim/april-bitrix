'use client';

import type {
    AiMatrixTable as AiMatrixTableData,
    AiMatrixTotalsTable,
    AiRatingDataset,
    AiScoreRatingPoint,
} from '@/modules/entities/ai-analytics';
import { EntityRatingChart } from '@/modules/feature/report-rating';
import { AI_MATRIX_BLOCK_TEXT } from '../../lib/ai-matrix-texts';
import type { AiScoreIndicator } from '../../lib/ai-types-matrix-view.util';
import { aiMatrixNorms } from '../../lib/ai-matrix-view.util';
import { AiMatrixHiddenNote } from './AiMatrixHiddenNote';
import { AiMatrixProfileChart } from './AiMatrixProfileChart';
import { AiMatrixTable } from './AiMatrixTable';
import { AiScoreRatingChart } from './AiScoreRatingChart';

export interface AiMatrixSummaryProps {
    matrix: AiMatrixTableData;
    totalsRow: AiMatrixTotalsTable;
    columnHints: Map<string, string>;
    onColumnClick?: (code: string) => void;
    hiddenManagers: number;
    showHidden: boolean;
    onToggleHidden: () => void;
    /** «корзинам звонков» / «типам звонков» / «разделам разговора». */
    profileColumnsLabel: string;
    indicators: AiScoreIndicator[];
    points: AiScoreRatingPoint[];
    countDataset: AiRatingDataset;
    /** Уточнение блока в заголовках и ключах памяти («AI: типы»). */
    blockLabel: string;
    storagePrefix: string;
}

const T = AI_MATRIX_BLOCK_TEXT.rating;

/**
 * Вкладка «Сводный» матриц AI по образцу KpiReportBlock: таблица со
 * строкой «Итого по отделу» → скрытые сотрудники → профиль (оценки
 * сотрудника рядом со средним по отделу) → средняя оценка по сотрудникам
 * → больше всего разборов по сотрудникам.
 */
export const AiMatrixSummary = ({
    matrix,
    totalsRow,
    columnHints,
    onColumnClick,
    hiddenManagers,
    showHidden,
    onToggleHidden,
    profileColumnsLabel,
    indicators,
    points,
    countDataset,
    blockLabel,
    storagePrefix,
}: AiMatrixSummaryProps) => {
    const norms = aiMatrixNorms(matrix);
    return (
        <div className="space-y-3">
            <AiMatrixTable
                matrix={matrix}
                totals={totalsRow}
                columnHints={columnHints}
                onColumnClick={onColumnClick}
            />
            <AiMatrixHiddenNote
                hiddenCount={hiddenManagers}
                showHidden={showHidden}
                onToggle={onToggleHidden}
            />
            <AiMatrixProfileChart
                matrix={matrix}
                columnsLabel={profileColumnsLabel}
                storageKey={`${storagePrefix}-profile`}
            />
            <AiScoreRatingChart
                entityLabel={T.employees}
                points={points}
                indicators={indicators}
                norms={norms}
                storageKey={`${storagePrefix}-summary-users`}
            />
            <EntityRatingChart
                title={`${T.mostReviews(T.employees)} (${blockLabel})`}
                dataset={countDataset}
            />
        </div>
    );
};
