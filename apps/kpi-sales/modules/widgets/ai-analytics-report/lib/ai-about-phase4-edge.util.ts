import type { AiAboutEdgeEffect } from '@/modules/entities/ai-analytics/model';
import { formatAiRate } from '@/modules/entities/ai-analytics/lib/ai-metric.util';
import { pluralRu } from '@/modules/entities/ai-analytics/lib/ai-readiness.data';
import {
    aiAboutFact as fact,
    aiAboutLabelOf,
    type AiAboutFact,
} from './ai-about-phase4.util';

/*
 * «Как считаем» → «Эффект советов»: шаг воронки «было / стало» словами.
 * Бэк отдаёт доли и разницу только при выборке не меньше минимума: мало
 * переходов — честно «мало данных», без процентов. Вынесено из
 * ai-about-phase4-checks.util.ts по лимиту 300 строк. Без React — vitest.
 */

/** Шаг воронки словами; незнакомый — нейтрально. */
export const AI_ABOUT_EDGE_LABELS: Readonly<Record<string, string>> = {
    call_to_presentation: 'Из звонка в презентацию',
    presentation_to_offer: 'Из презентации в КП',
    offer_to_invoice: 'Из КП в счёт',
    invoice_to_sale: 'Из счёта в продажу',
};

export const AI_ABOUT_EDGE_OTHER = 'Другой шаг воронки';

/** Разность долей в пунктах со знаком: «+6», «−2», «0». */
const formatPoints = (value: number): string => {
    const points = Math.round(value * 100);
    if (points === 0) return '0';
    return `${points > 0 ? '+' : '−'}${Math.abs(points)}`;
};

const DIFF_VERDICT: Record<'up' | 'down' | 'same', string> = {
    up: 'стало лучше',
    down: 'стало хуже',
    same: 'разница в пределах случайности',
};

const POINT_FORMS = ['пункт', 'пункта', 'пунктов'] as const;

const WINDOW_FORMS = ['сравнение', 'сравнения', 'сравнений'] as const;

/**
 * «было 30 %, стало 36 %: стало лучше (+6 пунктов, вероятно от +2 до +14)».
 * Разницы нет — ни одного процента: сравнений нет — «данных пока нет»,
 * есть, но переходов мало — «мало данных: N сравнений».
 */
export const formatAiAboutEdgeEffect = (edge: AiAboutEdgeEffect): string => {
    const { before, after, diff, windows } = edge;
    if (!diff) {
        return windows > 0
            ? `мало данных: ${windows} ${pluralRu(windows, WINDOW_FORMS)} — сравнивать пока рано`
            : 'данных пока нет — сравнить не с чем';
    }
    if (before === null || after === null) {
        return 'мало данных — сравнивать пока рано';
    }
    const shares = `было ${formatAiRate(before)}, стало ${formatAiRate(after)}`;
    const verdict =
        diff.low !== null && diff.low > 0
            ? DIFF_VERDICT.up
            : diff.high !== null && diff.high < 0
              ? DIFF_VERDICT.down
              : DIFF_VERDICT.same;
    const points = Math.abs(Math.round(diff.value * 100));
    const main = `${formatPoints(diff.value)} ${pluralRu(points, POINT_FORMS)}`;
    const range =
        diff.low === null || diff.high === null
            ? ''
            : `, вероятно от ${formatPoints(diff.low)} до ${formatPoints(diff.high)}`;
    return `${shares}: ${verdict} (${main}${range})`;
};

/** Строка карточки по шагу воронки с подсказкой о числе сравнений. */
export const aiAboutEdgeFact = (edge: AiAboutEdgeEffect): AiAboutFact =>
    fact(
        aiAboutLabelOf(AI_ABOUT_EDGE_LABELS, edge.edge, AI_ABOUT_EDGE_OTHER),
        formatAiAboutEdgeEffect(edge),
        [
            `${edge.windows} ${pluralRu(edge.windows, WINDOW_FORMS)}: менеджер за месяцы до совета и после него.`,
        ],
    );
