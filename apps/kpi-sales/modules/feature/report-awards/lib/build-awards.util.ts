import type {
    ConversionResult,
    ConversionStepDef,
} from '@/modules/feature/report-conversions';
import {
    analyzeUserConversions,
    MIN_DENOMINATOR_FOR_CHAMPION,
} from '@/modules/feature/report-conversions';

/** «Лучший чемпион-шаг» пользователя: где он первый в команде. */
export interface AwardChampion {
    /** «Звонки > 10 мин → Продажа». */
    stepLabel: string;
    /** Процент шага у пользователя (может быть > 100). */
    percent: number;
    /** Ранг среди eligible-менеджеров (для чемпиона всегда 1). */
    rank: number;
    /** Сколько всего менеджеров имели достаточную базу на шаге. */
    total: number;
}

/** «Зона роста»: самый слабый относительно медианы шаг. */
export interface AwardZone {
    stepLabel: string;
    percent: number | null;
}

export interface UserAward {
    champion?: AwardChampion;
    zone?: AwardZone;
}

const stepLabel = (def: ConversionStepDef): string =>
    `${def.fromName} → ${def.toName}`;

/** Eligible-менеджеры на шаге i: есть процент и база ≥ порога чемпионства. */
const eligibleCount = (result: ConversionResult, stepIndex: number): number =>
    result.rows.reduce((count, row) => {
        const step = row.steps[stepIndex];
        return step &&
            step.percent !== null &&
            step.denominator >= MIN_DENOMINATOR_FOR_CHAMPION
            ? count + 1
            : count;
    }, 0);

/**
 * Награды per-user из ОБЩЕЙ командной конверсии: лучший чемпион-шаг
 * (первое место в команде при базе ≥ порога и total ≥ 2, чтобы не
 * праздновать «1 из 1») + зона роста (bottleneck относительно медианы).
 */
export const buildAwards = (
    result: ConversionResult,
): Record<number, UserAward> => {
    if (!result.stepDefs.length || !result.rows.length) return {};

    const byUserId: Record<number, UserAward> = {};

    result.rows.forEach(row => {
        const insight = analyzeUserConversions(result, row.userId);
        if (!insight) return;

        // Лучший чемпион-шаг: из шагов, где пользователь первый, берём
        // с максимальным процентом; «1 из 1» отсекаем (total ≥ 2).
        let champion: AwardChampion | undefined;
        insight.steps.forEach((step, stepIndex) => {
            if (!step.isChampion || step.user.percent === null) return;
            const total = eligibleCount(result, stepIndex);
            if (total < 2) return;
            if (!champion || step.user.percent > champion.percent) {
                champion = {
                    stepLabel: stepLabel(step.def),
                    percent: step.user.percent,
                    rank: 1,
                    total,
                };
            }
        });

        // Зона роста: bottleneck-шаг (если менеджер реально ниже медианы).
        let zone: AwardZone | undefined;
        if (insight.bottleneck) {
            const bottleneckStep = insight.steps.find(
                step =>
                    step.def.fromCode === insight.bottleneck!.fromCode &&
                    step.def.toCode === insight.bottleneck!.toCode,
            );
            zone = {
                stepLabel: stepLabel(insight.bottleneck),
                percent: bottleneckStep?.user.percent ?? null,
            };
        }

        if (champion || zone) {
            byUserId[row.userId] = { champion, zone };
        }
    });

    return byUserId;
};
