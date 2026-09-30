import type {
    AiAboutForecastAccuracy,
    AiAboutForecastAccuracyReason,
    AiAboutForecastAccuracyStatus,
    AiAboutInterval,
    AiAboutRecommendationsEffect,
    AiAboutRecommendationsEffectReason,
    AiAboutRecommendationsEffectStatus,
} from '@/modules/entities/ai-analytics/model';
import { formatAiRate } from '@/modules/entities/ai-analytics/lib/ai-metric.util';
import { pluralRu } from '@/modules/entities/ai-analytics/lib/ai-readiness.data';
import {
    AI_ABOUT_UNKNOWN_BADGE,
    aiAboutFact as fact,
    aiAboutLabelOf,
    aiAboutReasons,
    formatAiAboutPercentWithRange,
    formatAiAboutRangeWords,
    formatAiAboutSectionMonth,
    formatAiAboutShare,
    type AiAboutBadge,
    type AiAboutSectionView,
} from './ai-about-phase4.util';
import { aiAboutEdgeFact } from './ai-about-phase4-edge.util';

/*
 * «Как считаем» → проверки Фазы 4: «Точность прогноза на истории» (месяцы
 * без показа, попадание факта в вилку, точнее ли простых правил) и
 * «Эффект советов» (выдано, выполнено, несогласия, шаги воронки до и после
 * — ai-about-phase4-edge.util.ts). Интервалы — словами («вероятно от … до
 * …»), без кодов и формул. Простое правило прогноза — «по темпу с начала
 * месяца»: с ним бэк и сравнивает ошибку.
 */

/** Итог проверки на истории: общий для прогноза и советов. */
type AiAboutCheckStatus = AiAboutForecastAccuracyStatus &
    AiAboutRecommendationsEffectStatus;

const PASS_BADGE: AiAboutBadge = {
    label: 'проверка пройдена',
    tone: 'success',
};
const FAIL_BADGE: AiAboutBadge = {
    label: 'проверка не пройдена',
    tone: 'warning',
};

/* ---------- Точность прогноза на истории ---------- */

const FORECAST_BADGE: Record<AiAboutCheckStatus, AiAboutBadge> = {
    pass: PASS_BADGE,
    fail: FAIL_BADGE,
    insufficient: { label: 'закрытых месяцев пока мало', tone: 'muted' },
};

export const AI_ABOUT_FORECAST_REASON_LABELS: Record<
    AiAboutForecastAccuracyReason,
    string
> = {
    'not-enough-months': 'закрытых месяцев пока мало',
    'no-days': 'нет дней, по которым можно сравнить прогноз с фактом',
    'coverage-below': 'факт реже нужного попадает в вилку прогноза',
    'mase-naive': 'прогноз не точнее правила «по темпу с начала месяца»',
    'mase-mean3': 'прогноз не точнее среднего за три месяца',
    'mase-undefined': 'точность не с чем сравнить: у простых правил нет ошибки',
};

const FORECAST_TODO: Record<AiAboutCheckStatus, string> = {
    pass: 'Ничего делать не нужно: прогноз прошёл проверку на истории.',
    fail: 'Ничего делать не нужно: проверка повторится после следующего закрытого месяца. Если она не проходит несколько месяцев подряд — попросите разработчика проверить данные.',
    insufficient:
        'Ничего делать не нужно: копим закрытые месяцы, проверка пройдёт сама.',
};

/** Сравнение с простым правилом по отношению ошибок (меньше 1 — прогноз лучше). */
export type AiAboutErrorVerdict = 'better' | 'worse' | 'same';

export const aiAboutErrorVerdict = (
    ratio: AiAboutInterval,
): AiAboutErrorVerdict => {
    if (ratio.high !== null && ratio.high < 1) return 'better';
    if (ratio.low !== null && ratio.low > 1) return 'worse';
    return 'same';
};

const ERROR_VERDICT_WORDS: Record<AiAboutErrorVerdict, string> = {
    better: 'точнее',
    worse: 'хуже',
    same: 'разницу пока не отличить от случайности',
};

/** «точнее: ошибка 80 % от ошибки правила (вероятно от 65 до 95 %)»; null — «не считалось». */
export const formatAiAboutErrorRatio = (
    ratio: AiAboutInterval | null,
): string =>
    ratio
        ? `${ERROR_VERDICT_WORDS[aiAboutErrorVerdict(ratio)]}: ошибка ${formatAiAboutPercentWithRange(
              ratio.value,
              ratio.low,
              ratio.high,
          )} от ошибки правила`
        : 'не считалось';

/**
 * Покрытие вилки: «85 % дней из 30 (вероятно от 78 до 90 %), цель — 90 %»;
 * дней меньше минимума — «мало данных: 5 дней».
 */
export const formatAiAboutCoverage = (
    accuracy: Pick<AiAboutForecastAccuracy, 'coverage' | 'coverageTarget'>,
): string => {
    const { coverage, coverageTarget } = accuracy;
    if (!coverage) return 'не проверялось';
    const range = formatAiAboutRangeWords(coverage.low, coverage.high);
    const main =
        coverage.value === null
            ? formatAiAboutShare(coverage, 'days')
            : `${formatAiRate(coverage.value)} дней из ${coverage.n}${range ? ` (${range})` : ''}`;
    return coverageTarget === null
        ? main
        : `${main}, цель — ${formatAiRate(coverageTarget)}`;
};

const TENTHS_OF = 10;

/**
 * Подсказка к попаданию в вилку от цели покрытия: «примерно в 8 случаях
 * из 10»; цели нет — без числа.
 */
export const aiAboutCoverageHint = (coverageTarget: number | null): string => {
    const tenths =
        coverageTarget === null ? null : Math.round(coverageTarget * TENTHS_OF);
    const cases =
        tenths === null || tenths < 1 || tenths > TENTHS_OF
            ? 'в большинстве случаев'
            : `примерно в ${tenths} ${pluralRu(tenths, ['случае', 'случаях', 'случаях'])} из ${TENTHS_OF}`;
    return `Вилка — диапазон, в который продажи месяца должны попадать ${cases}.`;
};

/** Карточка «Точность прогноза на истории». */
export const buildAiAboutForecastAccuracy = (
    accuracy: AiAboutForecastAccuracy,
): AiAboutSectionView => {
    const maxHint =
        accuracy.errorRatioMax === null
            ? []
            : [
                  `Для показа ошибка прогноза должна быть не больше ${formatAiRate(accuracy.errorRatioMax)} от ошибки простого правила.`,
              ];
    return {
        title: 'Точность прогноза на истории',
        month: formatAiAboutSectionMonth(accuracy.monthKey),
        badge: aiAboutLabelOf(
            FORECAST_BADGE,
            accuracy.status,
            AI_ABOUT_UNKNOWN_BADGE,
        ),
        facts: [
            fact(
                'Месяцев без показа',
                `${accuracy.shadowMonths} из нужных ${accuracy.shadowMinMonths}`,
                [
                    'Сначала прогноз считается скрыто: мы сверяем его с фактом и показываем, только когда он доказал точность.',
                ],
            ),
            fact(
                'Факт попадал в вилку прогноза',
                formatAiAboutCoverage(accuracy),
                [aiAboutCoverageHint(accuracy.coverageTarget)],
            ),
            fact(
                'Против правила «по темпу с начала месяца»',
                formatAiAboutErrorRatio(accuracy.errorVsLastMonth),
                [
                    'Простое правило: сколько сделано с начала месяца, растянутое на весь месяц.',
                    ...maxHint,
                ],
            ),
            fact(
                'Против среднего за три месяца',
                formatAiAboutErrorRatio(accuracy.errorVsMean3),
                maxHint,
            ),
        ],
        reasons: aiAboutReasons(
            AI_ABOUT_FORECAST_REASON_LABELS,
            accuracy.reasons,
        ),
        todo: aiAboutLabelOf(
            FORECAST_TODO,
            accuracy.status,
            FORECAST_TODO.fail,
        ),
    };
};

/* ---------- Эффект советов ---------- */

const SIGNAL_FORMS = ['сигнал', 'сигнала', 'сигналов'] as const;
const MANAGER_FORMS = ['менеджера', 'менеджеров', 'менеджеров'] as const;

/**
 * «3 сигнала у 1 менеджера»: сигналы и менеджеры — разные числа (у одного
 * менеджера бывает несколько). Старый ответ без числа менеджеров — только
 * сигналы.
 */
export const formatAiAboutGoodhart = (
    effect: Pick<AiAboutRecommendationsEffect, 'goodhartFlags'> &
        Partial<Pick<AiAboutRecommendationsEffect, 'goodhartManagers'>>,
): string => {
    const flags = effect.goodhartFlags;
    if (flags <= 0) return 'нет';
    const signals = `${flags} ${pluralRu(flags, SIGNAL_FORMS)}`;
    const managers = effect.goodhartManagers;
    return typeof managers === 'number' && managers > 0
        ? `${signals} у ${managers} ${pluralRu(managers, MANAGER_FORMS)}`
        : signals;
};

const EFFECT_BADGE: Record<AiAboutCheckStatus, AiAboutBadge> = {
    pass: PASS_BADGE,
    fail: FAIL_BADGE,
    insufficient: { label: 'советов пока мало', tone: 'muted' },
};

export const AI_ABOUT_EFFECT_REASON_LABELS: Record<
    AiAboutRecommendationsEffectReason,
    string
> = {
    'issued-below-min': 'советов пока мало',
    'issued-below-n-min': 'советов пока мало, чтобы надёжно посчитать доли',
    'done-share-below': 'выполняют слишком малую долю советов',
    'disagree-above': 'с советами слишком часто не соглашаются',
    'no-positive-edge': 'ни один шаг воронки после советов заметно не вырос',
    'goodhart-flags': 'есть признаки подгонки цифр под показатель',
};

const EFFECT_TODO: Record<AiAboutCheckStatus, string> = {
    pass: 'Продолжайте отмечать «Сделано» у выполненных советов — так эффект остаётся проверяемым.',
    fail: 'Отмечайте у советов в таблице менеджеров «Сделано», если совет выполнен, и «Не согласен», если он не подходит, — без отметок эффект не проверить.',
    insufficient:
        'Отмечайте у советов в таблице менеджеров «Сделано» или «Не согласен» — без отметок эффект не проверить.',
};

/** Карточка «Эффект советов». */
export const buildAiAboutRecommendationsEffect = (
    effect: AiAboutRecommendationsEffect,
): AiAboutSectionView => ({
    title: 'Эффект советов',
    month: formatAiAboutSectionMonth(effect.monthKey),
    badge: aiAboutLabelOf(EFFECT_BADGE, effect.status, AI_ABOUT_UNKNOWN_BADGE),
    facts: [
        fact('Выдано советов', String(effect.issued), [
            `Из них уже можно сравнить «до» и «после»: ${effect.completedWindows}.`,
        ]),
        fact(
            'Выполнено',
            `${effect.done} — ${formatAiAboutShare(effect.doneShare, 'advices')}`,
        ),
        fact(
            'Несогласий',
            `${effect.disagree} — ${formatAiAboutShare(effect.disagreeShare, 'advices')}`,
        ),
        ...effect.beforeAfter.map(aiAboutEdgeFact),
        fact(
            'Признаки подгонки цифр',
            formatAiAboutGoodhart(effect),
            [
                'Подгонка — когда растёт сам показатель, а продажи нет (например, короткие «пустые» звонки ради счётчика).',
            ],
        ),
    ],
    reasons: aiAboutReasons(AI_ABOUT_EFFECT_REASON_LABELS, effect.reasons),
    todo: aiAboutLabelOf(EFFECT_TODO, effect.status, EFFECT_TODO.insufficient),
});
