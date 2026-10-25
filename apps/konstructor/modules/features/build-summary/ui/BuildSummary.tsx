'use client';

import { useBuildSummary } from '../hooks/use-build-summary';
import { SummaryFacts } from './SummaryFacts';
import { SummaryTotal } from './SummaryTotal';

/** Сводка текущей сборки: факты главной строки и итог основного набора. */
export const BuildSummary = () => {
    const summary = useBuildSummary();

    if (!summary.hasMainRow) return null;

    return (
        <div className="flex flex-col gap-3">
            <SummaryFacts facts={summary.facts} />
            <SummaryTotal total={summary.total} />
        </div>
    );
};
