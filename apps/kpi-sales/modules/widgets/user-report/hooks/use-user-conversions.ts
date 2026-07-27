'use client';

import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    analyzeUserConversions,
    useConversionDataset,
    useConversionsComputation,
    UserConversionInsight,
} from '@/modules/feature/report-conversions';

/**
 * Инсайт конверсий менеджера на фоне команды (цепочка merged-блока;
 * фолбэк на kpi-датасет). null — данных нет (секция не рендерится).
 */
export const useUserConversions = (
    userId: number,
): UserConversionInsight | null => {
    const config = useAppSelector(state => state.conversions.widget.merged);

    const mergedDataset = useConversionDataset('merged');
    const kpiDataset = useConversionDataset('kpi');
    const dataset = mergedDataset.rows.length ? mergedDataset : kpiDataset;

    const { result } = useConversionsComputation(
        dataset,
        config.codes,
        config.method,
    );

    const insight = analyzeUserConversions(result, userId);
    return insight && insight.steps.length ? insight : null;
};
