'use client';

import { useMemo } from 'react';
import type { RTableAnnotation } from '@workspace/april-ui';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import type { RatingDataset } from '@/modules/feature/report-rating';
import type {
    ConversionMethod,
    ConversionScope,
} from '../model/conversion.types';
import {
    buildConversionCellMap,
    buildConversionResult,
    buildMedianByCode,
    ConversionResult,
    ConversionStep,
} from '../lib/conversion-calc.util';
import { getDatasetForScope } from '../lib/conversion-dataset.util';
import { buildConversionAnnotations } from '../lib/conversion-annotations.util';

export interface ConversionsComputation {
    dataset: RatingDataset;
    result: ConversionResult;
    cellMap: Map<string, ConversionStep>;
    medianByCode: Map<string, ConversionStep>;
}

/**
 * Датасет scope поверх текущих (уже отфильтрованных) данных стора.
 * merged учитывает локальный фильтр объединённого отчёта.
 */
export const useConversionDataset = (
    scope: ConversionScope,
): RatingDataset => {
    const report = useAppSelector(state => state.report.report);
    const callings = useAppSelector(state => state.callingStatistics.items);
    const mergedSelection = useAppSelector(state => state.mergedReport);

    return useMemo(
        () =>
            getDatasetForScope(scope, report, callings ?? [], {
                selectedUsers: mergedSelection.selectedUsers,
                selectedActions: mergedSelection.selectedActions,
            }),
        [scope, report, callings, mergedSelection],
    );
};

/**
 * Аннотации «% конверсии» для ячеек основной таблицы scope
 * (undefined — конверсии выключены или цепочка неполная).
 */
export const useTableConversionAnnotations = (
    scope: ConversionScope,
): Map<string, RTableAnnotation> | undefined => {
    const config = useAppSelector(state => state.conversions.table[scope]);
    const dataset = useConversionDataset(scope);

    return useMemo(() => {
        if (!config.enabled) return undefined;
        const result = buildConversionResult(
            dataset,
            config.codes,
            config.method,
        );
        if (!result.stepDefs.length) return undefined;
        return buildConversionAnnotations(result, config.method);
    }, [config, dataset]);
};

/** Полный расчёт конверсий по произвольной цепочке поверх датасета. */
export const useConversionsComputation = (
    dataset: RatingDataset,
    codes: string[],
    method: ConversionMethod,
): ConversionsComputation =>
    useMemo(() => {
        const result = buildConversionResult(dataset, codes, method);
        return {
            dataset,
            result,
            cellMap: buildConversionCellMap(result),
            medianByCode: buildMedianByCode(result),
        };
    }, [dataset, codes, method]);
