import type { ReportData } from '@/modules/entities/report';
import type { ReportCallingData } from '@/modules/entities/calling-statistics';
import type { StructureSection } from '@/modules/feature/report-tabs';
import {
    applyMergedSelection,
    buildCallingRatingDataset,
    buildKpiRatingDataset,
    buildMergedRatingDataset,
    RatingDataset,
    RatingRow,
} from '@/modules/feature/report-rating';
import type { ConversionScope } from '../model/conversion.types';
import type { ConversionResult } from './conversion-calc.util';

export interface MergedSelection {
    selectedUsers: number[];
    selectedActions: string[];
}

/**
 * Датасет показателей для scope поверх уже отфильтрованных данных.
 * merged дополнительно режется локальным фильтром объединённого отчёта.
 */
export const getDatasetForScope = (
    scope: ConversionScope,
    report: ReportData[],
    callings: ReportCallingData[],
    mergedSelection?: MergedSelection,
): RatingDataset => {
    switch (scope) {
        case 'kpi':
            return buildKpiRatingDataset(report);
        case 'callings':
            return buildCallingRatingDataset(callings);
        case 'merged': {
            const dataset = buildMergedRatingDataset(report, callings);
            return mergedSelection
                ? applyMergedSelection(dataset, mergedSelection)
                : dataset;
        }
    }
};

/**
 * Конверсии как RatingDataset (actions = шаги «A → B», values = %) —
 * корм для EntityRatingChart «Победители — конверсии».
 */
export const buildConversionRatingDataset = (
    result: ConversionResult,
): RatingDataset => ({
    actions: result.stepDefs.map(def => ({
        code: `${def.fromCode}->${def.toCode}`,
        name: `${def.fromName} → ${def.toName}`,
    })),
    rows: result.rows.map(row => ({
        userId: row.userId,
        name: row.name,
        values: Object.fromEntries(
            row.steps.map(step => [
                `${step.fromCode}->${step.toCode}`,
                step.percent ?? 0,
            ]),
        ),
    })),
});

/**
 * Рейтинг секций (отделы/группы) по шагу конверсии: суммируем числители
 * и знаменатели по секции и делим. Суммировать/усреднять проценты нельзя,
 * поэтому buildSectionRating из report-rating здесь не подходит.
 */
export const buildSectionConversionRating = (
    result: ConversionResult,
    sections: StructureSection[],
    stepIndex: number,
): RatingRow[] =>
    sections
        .map(section => {
            const ids = new Set(section.userIds);
            const rows = result.rows.filter(row => ids.has(row.userId));
            const numerator = rows.reduce(
                (sum, row) => sum + (row.steps[stepIndex]?.numerator ?? 0),
                0,
            );
            const denominator = rows.reduce(
                (sum, row) => sum + (row.steps[stepIndex]?.denominator ?? 0),
                0,
            );
            return {
                name: section.name,
                value:
                    denominator === 0
                        ? 0
                        : Math.round((numerator / denominator) * 1000) / 10,
            };
        })
        .sort((a, b) => b.value - a.value);
