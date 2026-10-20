'use client';

import { useCallback, useMemo } from 'react';
import { shallowEqual } from 'react-redux';
import { useAppSelector } from '@/modules/app';
import {
    aiMatrixCoverageReason,
    selectAiAnalysisSince,
    selectAiMinDurationSec,
    selectAiOverviewScope,
    type AiBucketScore,
    type AiByTypeCoverage,
    type AiMatrixCoverageReason,
} from '@/modules/entities/ai-analytics';

/**
 * Общий контекст матриц KPI-вида из стора: конвейер разбора портала,
 * порог длительности, день старта разбора, выбранные в фильтре сотрудники,
 * период запроса (как у обзора) и точные оценки корзин по менеджеру из
 * строк обзора — для корзин «AI: типы звонков» и пустых состояний.
 */
export const useAiMatrixContext = () => {
    const callReport = useAppSelector(
        state => state.aiAnalytics.settings.data?.callReport ?? null,
    );
    const settingsComparableFrom = useAppSelector(
        state =>
            state.aiAnalytics.settings.data?.comparableFrom ||
            state.aiAnalytics.settings.data?.readiness.comparableFrom ||
            null,
    );
    const minDurationSec = useAppSelector(selectAiMinDurationSec);
    const analysisSince = useAppSelector(selectAiAnalysisSince);
    const filterManagerIds = useAppSelector(
        state => state.department.current.map(user => Number(user.ID)),
        shallowEqual,
    );
    const period = useAppSelector(state => {
        const scope = selectAiOverviewScope(state);
        return {
            from: scope?.filters.from ?? state.report.date.from,
            to: scope?.filters.to ?? state.report.date.to,
        };
    }, shallowEqual);
    const overviewManagers = useAppSelector(
        state => state.aiAnalytics.overview.data?.managers ?? null,
    );

    const bucketsOf = useCallback(
        (managerId: string): readonly AiBucketScore[] | null =>
            overviewManagers?.find(row => row.managerId === managerId)
                ?.buckets ?? null,
        [overviewManagers],
    );

    return {
        callReport,
        settingsComparableFrom,
        minDurationSec,
        analysisSince,
        filterManagerIds,
        period,
        bucketsOf,
    };
};

export type AiMatrixContext = ReturnType<typeof useAiMatrixContext>;

export interface AiMatrixCoverageView {
    reason: AiMatrixCoverageReason;
    /** Дата сравнимости: из ответа среза, иначе из настроек; null — нет. */
    comparableFrom: string | null;
    minDurationSec: number | null;
}

/** Причина пустой матрицы и даты для легенды по покрытию среза и контексту. */
export const useAiMatrixCoverage = (
    ctx: AiMatrixContext,
    coverage: AiByTypeCoverage | null | undefined,
): AiMatrixCoverageView =>
    useMemo(
        () => ({
            reason: aiMatrixCoverageReason({
                coverage,
                callReport: ctx.callReport,
                filterManagerIds: ctx.filterManagerIds,
                analysisSince: ctx.analysisSince,
                minDurationSec: ctx.minDurationSec,
                period: ctx.period,
            }),
            comparableFrom:
                coverage?.comparableFrom || ctx.settingsComparableFrom || null,
            minDurationSec: ctx.minDurationSec,
        }),
        [
            coverage,
            ctx.callReport,
            ctx.filterManagerIds,
            ctx.analysisSince,
            ctx.minDurationSec,
            ctx.period,
            ctx.settingsComparableFrom,
        ],
    );
