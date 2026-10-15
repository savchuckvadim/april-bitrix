'use client';

import { useMemo } from 'react';
import { buildPlanRatingDataset, type EnabledPlanIndicator } from '@/modules/feature/plans';
import { EntityRatingChart } from '@/modules/feature/report-rating';
import {
    aggregateDigestPlanCells,
    buildDigestPlanRatingBoards,
    type DigestPlanRow,
} from '../../lib/digest-plan-fact.util';
import { DigestPlanRatingList } from './DigestPlanRatingList';
import { DigestPlanTable } from './DigestPlanTable';

interface DigestPlansSectionProps {
    indicators: EnabledPlanIndicator[];
    rows: DigestPlanRow[];
    expected: number;
    /** Подпись секции в заголовке графика (отдел/группа). */
    sectionName?: string;
}

/** Секция плана дня: таблица связки, рейтинг достигаемости, график победителей. */
export const DigestPlansSection = ({
    indicators,
    rows,
    expected,
    sectionName,
}: DigestPlansSectionProps) => {
    const totals = useMemo(
        () => (rows.length > 1 ? aggregateDigestPlanCells(indicators, rows) : null),
        [indicators, rows],
    );
    const boards = useMemo(
        () => buildDigestPlanRatingBoards(indicators, rows),
        [indicators, rows],
    );
    const dataset = useMemo(
        () => buildPlanRatingDataset([...indicators], rows),
        [indicators, rows],
    );
    const hasRating = rows.length > 1 && boards.some(board => board.participants > 1);

    return (
        <div className="space-y-4">
            <DigestPlanTable indicators={indicators} rows={rows} totals={totals} expected={expected} />
            {hasRating && (
                <>
                    <div>
                        <h4 className="mb-2 text-sm font-semibold">
                            Достигаемость плана руководителя
                        </h4>
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                            {boards.map(board => (
                                <DigestPlanRatingList key={board.indicator.code} board={board} />
                            ))}
                        </div>
                    </div>
                    <EntityRatingChart
                        title={`Победители дня — выполнение плана, %${sectionName ? ` (${sectionName})` : ''}`}
                        dataset={dataset}
                    />
                </>
            )}
        </div>
    );
};
