import type { AiDossierSeriesPoint, AiObjectionCategory } from '../model';
import {
    aiMetricLowMax,
    aiMetricMinN,
    isAiMetricHidden,
    isAiMetricLegacy,
    type AiHint,
    type AiMetricThresholds,
} from './ai-metric.util';
import { aiObjectionCategoryLabel } from './ai-overview.data';
import { pluralRu } from './ai-readiness.data';
import { formatAiPct } from './ai-score.util';

/*
 * Ряды недель и месяцев досье: подписи колонок, пометки точки (оценено
 * меньше, чем разобрано; разборы до смены версии; смешанные версии),
 * бэйдж порога вместо общего «мало данных» и возражения с долей
 * отработанных. Пороги — из ответа бэка, иначе дефолты реестра.
 */

export const AI_DOSSIER_SERIES_TEXT = {
    period: 'Период',
    analyzed: {
        label: 'Разобрано',
        hint: {
            title: 'Разобрано',
            lines: [
                'Сколько звонков сотрудника за период разобрал AI.',
                'Не считаются звонки короче порога длительности и звонки до даты, с которой разборы сравнимы между собой.',
            ],
        },
    },
    score: {
        label: 'Оценка',
        hint: {
            title: 'Оценка',
            lines: [
                'Средняя оценка разобранных звонков периода, от 1 до 10.',
                'В неё идут только звонки с баллом, которые относятся к контакту, презентации или закрытию — поэтому оценённых бывает меньше, чем разобранных.',
            ],
        },
    },
    /** Бэйдж вместо «мало данных: 5 звонков»: порог и сколько есть. */
    threshold: (minN: number, scored: number) =>
        `оценка с ${minN} звонков (сейчас ${scored})`,
    thresholdHint: (minN: number, lowMax: number): AiHint => ({
        title: 'Оценки пока нет',
        lines: [
            `Среднюю оценку показываем, когда в периоде не меньше ${minN} оценённых звонков: по меньшему числу она слишком случайна.`,
            `От ${minN} до ${lowMax - 1} звонков цифра показывается пунктиром — ориентир, но не повод для выводов.`,
        ],
    }),
    scoredOf: (scored: number, analyzed: number) =>
        `оценено ${scored} из ${analyzed}`,
    scoredOfHint: {
        title: 'Оценено меньше, чем разобрано',
        lines: [
            'В среднюю оценку идут звонки с баллом, которые относятся к контакту, презентации или закрытию.',
            'Звонки «прочее» и «не по делу» разобраны, но в оценку не входят.',
        ],
    },
    beforeComparable: (count: number) => `+${count} до смены версии`,
    beforeComparableHint: {
        title: 'Разборы до смены версии',
        lines: [
            'Эти звонки разобраны по прежним правилам и с новыми не сравниваются.',
            'Они не входят ни в число разобранных, ни в оценку.',
        ],
    },
    versionsMixed: {
        label: 'разные версии разбора',
        hint: {
            title: 'Разные версии разбора',
            lines: [
                'На этой неделе часть звонков разобрана старой версией, часть новой.',
                'Сравнивать её с соседними неделями нужно осторожно.',
            ],
        },
    },
} as const;

/** Пометки точки ряда, которые рисуются рядом с числом разборов и оценкой. */
export interface AiDossierPointNotes {
    /** «оценено 6 из 7» — оценённых меньше, чем разобранных; null — совпадают. */
    scoredOf: string | null;
    /** «+3 до смены версии»; null — таких разборов нет. */
    beforeComparable: string | null;
    /** Неделя со смешанными версиями разбора. */
    versionsMixed: boolean;
    /** Подпись бэйджа вместо «мало данных»; null — оценка показана или старый расчёт. */
    hiddenLabel: string | null;
}

export const aiDossierPointNotes = (
    point: AiDossierSeriesPoint,
    thresholds?: AiMetricThresholds,
): AiDossierPointNotes => {
    const scored = point.score.n;
    const hidden = isAiMetricHidden(point.score) && !isAiMetricLegacy(point.score);
    return {
        scoredOf:
            scored < point.n
                ? AI_DOSSIER_SERIES_TEXT.scoredOf(scored, point.n)
                : null,
        beforeComparable:
            point.nBeforeComparable > 0
                ? AI_DOSSIER_SERIES_TEXT.beforeComparable(point.nBeforeComparable)
                : null,
        versionsMixed: point.versionsMixed === true,
        hiddenLabel: hidden
            ? AI_DOSSIER_SERIES_TEXT.threshold(aiMetricMinN(thresholds), scored)
            : null,
    };
};

/** Подсказка к бэйджу порога: минимум для показа и граница пунктира. */
export const aiDossierThresholdHint = (
    thresholds?: AiMetricThresholds,
): AiHint =>
    AI_DOSSIER_SERIES_TEXT.thresholdHint(
        aiMetricMinN(thresholds),
        aiMetricLowMax('score', thresholds),
    );

/* ---------- Возражения ---------- */

const TIMES_FORMS = ['раз', 'раза', 'раз'] as const;
const CALLS_IN_FORMS = ['звонке', 'звонках', 'звонках'] as const;

export const AI_DOSSIER_OBJECTIONS_TEXT = {
    title: 'Возражения',
    hint: (minKnown: number): AiHint => ({
        title: 'Возражения клиентов',
        lines: [
            'Считаются те же разобранные звонки, что в рядах выше.',
            `Долю отработанных показываем, когда возражений с известным итогом не меньше ${minKnown}.`,
        ],
    }),
} as const;

/** «Цена: 5 раз в 4 звонках · отработано 60 %»; доли нет — без хвоста. */
export const formatAiDossierObjection = (
    category: AiObjectionCategory,
): string => {
    const base =
        `${aiObjectionCategoryLabel(category.category)}: ` +
        `${category.n} ${pluralRu(category.n, TIMES_FORMS)} в ` +
        `${category.calls} ${pluralRu(category.calls, CALLS_IN_FORMS)}`;
    const rate = category.handledRatePct.value;
    return rate === null ? base : `${base} · отработано ${formatAiPct(rate)}`;
};
