'use client';

import type {
    AiRatingDataset,
    AiScoreRatingPoint,
} from '@/modules/entities/ai-analytics';
import { EntityRatingChart } from '@/modules/feature/report-rating';
import type { StructureSection } from '@/modules/feature/report-tabs';
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
    /** Префикс ключей памяти выбранного показателя графиков оценок. */
    storagePrefix: string;
}

/**
 * Футер вкладки разбивки матриц AI (как RatingFooter KPI-отчёта):
 * победители по счётчикам и по оценке — сначала сущности (отделы/группы),
 * затем сотрудники.
 */
export const AiMatrixRatingFooter = ({
    entityLabel,
    blockLabel,
    sections,
    dataset,
    points,
    indicators,
    storagePrefix,
}: AiMatrixRatingFooterProps) => (
    <div className="mt-6 space-y-4">
        <EntityRatingChart
            title={`Победители — ${entityLabel} (${blockLabel})`}
            dataset={dataset}
            sections={sections}
        />
        <AiScoreRatingChart
            title={`Оценка — ${entityLabel}`}
            points={points}
            indicators={indicators}
            sections={sections}
            storageKey={`${storagePrefix}-${entityLabel}`}
        />
        <EntityRatingChart
            title={`Победители — сотрудники (${blockLabel})`}
            dataset={dataset}
        />
        <AiScoreRatingChart
            title="Оценка — сотрудники"
            points={points}
            indicators={indicators}
            storageKey={`${storagePrefix}-users`}
        />
    </div>
);
