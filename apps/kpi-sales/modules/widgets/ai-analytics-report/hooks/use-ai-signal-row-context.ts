'use client';

import { useMemo } from 'react';
import { useAppSelector } from '@/modules/app';
import {
    selectAiAnalysisSince,
    type AiOverview,
} from '@/modules/entities/ai-analytics';
import { planExpectedShare } from '@/modules/feature/plans';
import type { AiAnalyzedContext } from '../lib/ai-signal.util';
import { aiOverviewComparableFrom } from '../lib/ai-overview-meta.util';

/** Что нужно каждой строке таблицы сигналов, но не меняется от строки к строке. */
export interface AiSignalRowContext {
    /** Статус конвейера, период и дата сравнимости — для «разобрано N из M». */
    analyzed: AiAnalyzedContext;
    /** Ожидаемая доля плана к «сейчас» — риска на полосе «План руководителя». */
    planExpected: number;
}

/**
 * Контекст строк из обзора и настроек: один расчёт на таблицу, чтобы
 * двадцать строк не читали стор и не считали ожидаемую долю плана каждая.
 */
export const useAiSignalRowContext = (
    overview: AiOverview,
): AiSignalRowContext => {
    const callReport = useAppSelector(
        state => state.aiAnalytics.settings.data?.callReport,
    );
    const analysisSince = useAppSelector(selectAiAnalysisSince);
    return useMemo(
        () => ({
            analyzed: {
                periodTo: overview.period.to,
                analysisSince,
                callReport,
                comparableFrom: aiOverviewComparableFrom(overview),
            },
            planExpected: planExpectedShare(
                overview.period.from,
                overview.period.to,
            ),
        }),
        [overview, callReport, analysisSince],
    );
};
