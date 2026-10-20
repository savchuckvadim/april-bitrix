'use client';

import type {
    AiRatingDataset,
    AiScoreRatingPoint,
} from '@/modules/entities/ai-analytics';
import { EntityRatingChart } from '@/modules/feature/report-rating';
import type { StructureSection } from '@/modules/feature/report-tabs';
import { AI_MATRIX_BLOCK_TEXT } from '../../lib/ai-matrix-texts';
import type { AiScoreIndicator } from '../../lib/ai-types-matrix-view.util';
import { AiScoreRatingChart } from './AiScoreRatingChart';

interface AiMatrixRatingFooterProps {
    /** Подпись сущностей: «отделы» / «группы». */
    entityLabel: string;
    /**
     * Уточнение блока в заголовках («AI: типы»): у EntityRatingChart
     * память показателя по заголовку — не пересекаемся с KPI-отчётом.
     */
    blockLabel: string;
    sections: StructureSection[];
    /** Счётчики (разборов, продаж) — суммируются по секции. */
    dataset: AiRatingDataset;
    /** Оценки — взвешенное среднее по секции, не сумма. */
    points: AiScoreRatingPoint[];
    indicators: AiScoreIndicator[];
    /** Среднее по отделу по коду показателя — линия на графике оценок. */
    norms: ReadonlyMap<string, number | null>;
    /** Префикс ключей памяти выбранного показателя графиков оценок. */
    storagePrefix: string;
}

const T = AI_MATRIX_BLOCK_TEXT.rating;

/**
 * Футер вкладки разбивки матриц AI (как RatingFooter KPI-отчёта): больше
 * всего разборов и средняя оценка — сначала сущности (отделы/группы),
 * затем сотрудники.
 */
export const AiMatrixRatingFooter = ({
    entityLabel,
    blockLabel,
    sections,
    dataset,
    points,
    indicators,
    norms,
    storagePrefix,
}: AiMatrixRatingFooterProps) => (
    <div className="mt-6 space-y-4">
        <EntityRatingChart
            title={`${T.mostReviews(entityLabel)} (${blockLabel})`}
            dataset={dataset}
            sections={sections}
        />
        <AiScoreRatingChart
            entityLabel={entityLabel}
            points={points}
            indicators={indicators}
            norms={norms}
            sections={sections}
            storageKey={`${storagePrefix}-${entityLabel}`}
        />
        <EntityRatingChart
            title={`${T.mostReviews(T.employees)} (${blockLabel})`}
            dataset={dataset}
        />
        <AiScoreRatingChart
            entityLabel={T.employees}
            points={points}
            indicators={indicators}
            norms={norms}
            storageKey={`${storagePrefix}-users`}
        />
    </div>
);
