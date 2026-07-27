/**
 * План-аннотации для таблиц отчётов (вторая подстрока под значением,
 * канал planAnnotations RTable): «⌖ план · %». Ключи — те же, что у
 * данных таблиц: `${userId}:${innerCode}` (kpi/merged) и
 * `${userId}:${bucketId}` (звонки). Строятся только для показателей
 * соответствующего источника и только по видимым пользователям
 * (рядовой — только своя строка).
 */
import type { RTableAnnotation } from '@workspace/april-ui';
import type { PlanFactSource } from '../model';
import {
    EnabledPlanIndicator,
    PlanAchievementRow,
} from './plan-achievement.util';
import {
    formatPlanPercent,
    formatPlanValue,
    PLAN_PERIOD_LABELS,
    planTone,
} from './plans.data';

/** Токен-класс подстроки по тону достижения. */
const TONE_TEXT_CLASS: Record<string, string> = {
    success: 'text-success',
    warning: 'text-warning',
    destructive: 'text-destructive',
};

/**
 * Карта план-аннотаций для источника (kpi → основные таблицы событий/
 * объединённого; calling → таблица звонков).
 */
export const buildPlanAnnotations = (
    source: PlanFactSource,
    indicators: EnabledPlanIndicator[],
    rows: PlanAchievementRow[],
    expected: number,
): Map<string, RTableAnnotation> => {
    const annotations = new Map<string, RTableAnnotation>();
    indicators.forEach((indicator, index) => {
        if (indicator.factSource !== source) return;
        rows.forEach(row => {
            const cell = row.cells[index];
            if (!cell || cell.plan === null) return;
            annotations.set(`${row.userId}:${indicator.factKey}`, {
                text: `⌖ ${formatPlanValue(cell.plan, indicator.unit)} · ${formatPlanPercent(cell.percent)}`,
                className:
                    TONE_TEXT_CLASS[planTone(cell.percent, expected)] ??
                    'text-muted-foreground',
                tooltip:
                    `План «${indicator.displayName}» (${PLAN_PERIOD_LABELS[indicator.periodType]}), ` +
                    `пересчитан на выбранный период: ${formatPlanValue(cell.plan, indicator.unit)}.\n` +
                    `Факт: ${formatPlanValue(cell.fact, indicator.unit)} · выполнение ${formatPlanPercent(cell.percent)}.\n` +
                    `Ожидаемый темп к сейчас: ${formatPlanPercent(expected)}.`,
            });
        });
    });
    return annotations;
};

/** Слияние план-аннотаций нескольких источников (kpi+calling для merged). */
export const mergePlanAnnotations = (
    ...maps: Map<string, RTableAnnotation>[]
): Map<string, RTableAnnotation> => {
    const merged = new Map<string, RTableAnnotation>();
    maps.forEach(map => map.forEach((value, key) => merged.set(key, value)));
    return merged;
};
