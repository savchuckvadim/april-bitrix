import type { Tone } from '@workspace/april-ui';
import type {
    AiAboutInterval,
    AiAboutShare,
} from '@/modules/entities/ai-analytics/model';
import {
    formatAiCi90Words,
    formatAiRate,
} from '@/modules/entities/ai-analytics/lib/ai-metric.util';
import { pluralRu } from '@/modules/entities/ai-analytics/lib/ai-readiness.data';
import { formatAiMonthKey } from '@/modules/entities/ai-analytics/lib/ai-period-label.util';

/*
 * «Как считаем», секции Фазы 4: общий вид карточки (AiAboutSectionView —
 * статус, факты «подпись — значение», сложное — в подсказку, причины и
 * строка «что делать») и словесные форматтеры интервалов, долей, проверок
 * и связи качества с КП. Секции: ai-about-quality-link.util.ts,
 * ai-about-pool.util.ts, ai-about-phase4-checks.util.ts. Без React — vitest.
 */

/** Бэйдж статуса секции. */
export interface AiAboutBadge {
    label: string;
    tone: Tone;
}

/** Строка карточки: подпись — значение; hint — строки подсказки (пусто — без неё). */
export interface AiAboutFact {
    label: string;
    value: string;
    hint: string[];
}

/** Готовая карточка секции Фазы 4. */
export interface AiAboutSectionView {
    title: string;
    /** Месяц расчёта словами: «сентябрь 2026». */
    month: string;
    badge: AiAboutBadge;
    facts: AiAboutFact[];
    /** Почему проверка не пройдена — по-русски, без кодов. */
    reasons: string[];
    /** Что делать руководителю. */
    todo: string;
}

/** Статус, которого фронт ещё не знает, — нейтрально, без кода. */
export const AI_ABOUT_UNKNOWN_BADGE: AiAboutBadge = {
    label: 'состояние уточняется',
    tone: 'muted',
};

/** Незнакомая причина с бэка — нейтральная подпись. */
export const AI_ABOUT_UNKNOWN_REASON =
    'другая причина — подробности у разработчика';

/** Подпись по словарю; незнакомый код → запасная строка (не крэш). */
export const aiAboutLabelOf = <T>(
    dictionary: Readonly<Record<string, T>>,
    code: string | null | undefined,
    fallback: T,
): T =>
    code != null && Object.prototype.hasOwnProperty.call(dictionary, code)
        ? (dictionary[code] ?? fallback)
        : fallback;

/** Причины словами без повторов; незнакомые — одной нейтральной строкой. */
export const aiAboutReasons = (
    dictionary: Readonly<Record<string, string>>,
    codes: readonly string[],
): string[] => [
    ...new Set(
        codes.map(code =>
            aiAboutLabelOf(dictionary, code, AI_ABOUT_UNKNOWN_REASON),
        ),
    ),
];

/** Строка карточки; подсказка по желанию. */
export const aiAboutFact = (
    label: string,
    value: string,
    hint: string[] = [],
): AiAboutFact => ({ label, value, hint });

/** Месяц расчёта: «2026-09» → «сентябрь 2026». */
export const formatAiAboutSectionMonth = formatAiMonthKey;

/* ---------- Интервалы и доли словами ---------- */

/** «вероятно от 31 до 55 %» по 90 %-интервалу доли; нет границ — пусто. */
export const formatAiAboutRangeWords = (
    low: number | null,
    high: number | null,
): string =>
    low === null || high === null ? '' : formatAiCi90Words([low, high]);

/** «42 % (вероятно от 31 до 55 %)»; без границ — только доля. */
export const formatAiAboutPercentWithRange = (
    value: number,
    low: number | null,
    high: number | null,
): string => {
    const range = formatAiAboutRangeWords(low, high);
    return range ? `${formatAiRate(value)} (${range})` : formatAiRate(value);
};

const COUNT_FORMS = {
    days: ['день', 'дня', 'дней'],
    advices: ['совет', 'совета', 'советов'],
} as const;

/** Доля с интервалом; value null — «мало данных: 5 советов». */
export const formatAiAboutShare = (
    share: AiAboutShare,
    unit: keyof typeof COUNT_FORMS,
): string =>
    share.value === null
        ? `мало данных: ${share.n} ${pluralRu(share.n, COUNT_FORMS[unit])}`
        : formatAiAboutPercentWithRange(share.value, share.low, share.high);

/** Проверка «да / нет / не делали». */
export type AiAboutCheck = 'pass' | 'fail' | 'unknown';

export const AI_ABOUT_CHECK_LABELS: Record<AiAboutCheck, string> = {
    pass: 'пройдена',
    fail: 'не пройдена',
    unknown: 'не проверялась',
};

export const aiAboutCheckOf = (passed: boolean | null): AiAboutCheck =>
    passed === null ? 'unknown' : passed ? 'pass' : 'fail';

/* ---------- Связь качества с КП словами ---------- */

/** Уверенность в направлении связи по 90 %-интервалу. */
export type AiAboutLinkDirection = 'up' | 'down' | 'unsure';

export const aiAboutLinkDirection = (
    link: AiAboutInterval,
): AiAboutLinkDirection => {
    if (link.low !== null && link.low > 0) return 'up';
    if (link.high !== null && link.high < 0) return 'down';
    return 'unsure';
};

/** Главная фраза о связи: «чем выше качество, тем чаще КП: связь уверенная». */
export const aiAboutLinkSentence = (link: AiAboutInterval | null): string => {
    if (!link) return 'не оценена';
    switch (aiAboutLinkDirection(link)) {
        case 'up':
            return 'чем выше качество, тем чаще КП: связь уверенная';
        case 'down':
            return 'чем выше качество, тем реже КП: связь уверенная';
        default:
            return link.value > 0
                ? 'чем выше качество, тем чаще КП: связь неуверенная'
                : 'связь качества с КП не видна: оценка неуверенная';
    }
};

/** Изменение шансов за балл качества в процентах со знаком: «+30 %», «−12 %». */
const formatOddsChange = (slope: number, unit = ' %'): string => {
    const pct = Math.round((Math.exp(slope) - 1) * 100);
    if (pct === 0) return `0${unit}`;
    return `${pct > 0 ? '+' : '−'}${Math.abs(pct).toLocaleString('ru-RU')}${unit}`;
};

/** «шансы на КП за балл качества: +30 % (вероятно от +10 до +50 %)». */
export const formatAiAboutOdds = (link: AiAboutInterval): string => {
    const main = `шансы на КП за каждый балл качества: ${formatOddsChange(link.value)}`;
    return link.low === null || link.high === null
        ? main
        : `${main} (вероятно от ${formatOddsChange(link.low, '')} до ${formatOddsChange(link.high)})`;
};
