import type { Intent } from '@workspace/april-ui';
import {
    ConversionResult,
    ConversionStep,
    ConversionStepDef,
} from './conversion-calc.util';
import { getConversionIntent } from './conversion-intent.util';
import { MIN_DENOMINATOR_FOR_CHAMPION } from './conversion-catalog';

export interface UserConversionStepInsight {
    def: ConversionStepDef;
    user: ConversionStep;
    /** Медиана команды по шагу (null — не рассчитывается). */
    teamMedian: number | null;
    /** Отклонение от медианы в процентных пунктах (null — нет базы). */
    deltaPct: number | null;
    /** Лучший в команде по шагу (при знаменателе ≥ порога). */
    isChampion: boolean;
    intent: Intent | null;
}

export interface UserConversionInsight {
    steps: UserConversionStepInsight[];
    /** Самый слабый шаг относительно медианы — «зона роста». */
    bottleneck: ConversionStepDef | null;
}

/**
 * Разбор конверсий менеджера на фоне команды: чемпионство по шагам,
 * дельта к медиане и bottleneck (минимальное отношение к медиане).
 */
export const analyzeUserConversions = (
    result: ConversionResult,
    userId: number,
): UserConversionInsight | null => {
    const row = result.rows.find(item => item.userId === userId);
    if (!row || !result.stepDefs.length) return null;

    let bottleneck: ConversionStepDef | null = null;
    let worstRatio = Infinity;

    const steps: UserConversionStepInsight[] = row.steps.map((step, i) => {
        const median = result.median[i]?.percent ?? null;
        const deltaPct =
            step.percent === null || median === null
                ? null
                : step.percent - median;

        const isChampion =
            step.percent !== null &&
            step.denominator >= MIN_DENOMINATOR_FOR_CHAMPION &&
            !result.rows.some(
                other =>
                    other.userId !== userId &&
                    other.steps[i]?.percent !== null &&
                    (other.steps[i]?.denominator ?? 0) >=
                        MIN_DENOMINATOR_FOR_CHAMPION &&
                    (other.steps[i]?.percent ?? 0) > step.percent!,
            );

        if (
            step.percent !== null &&
            median !== null &&
            median > 0 &&
            step.percent / median < worstRatio
        ) {
            worstRatio = step.percent / median;
            bottleneck = result.stepDefs[i] ?? null;
        }

        return {
            def: result.stepDefs[i]!,
            user: step,
            teamMedian: median,
            deltaPct,
            isChampion,
            intent: getConversionIntent(step, result.median[i]),
        };
    });

    // «Зона роста» осмысленна только если менеджер реально ниже медианы.
    return { steps, bottleneck: worstRatio < 1 ? bottleneck : null };
};
