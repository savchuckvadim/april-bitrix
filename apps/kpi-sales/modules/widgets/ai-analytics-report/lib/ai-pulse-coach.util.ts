import {
    AI_PULSE_TEXT,
    aiPulseRatioWords,
    type AiPulse,
} from '@/modules/entities/ai-analytics';
import { aiCardLink } from './ai-card-link.util';

/*
 * Пульс глазами руководителя (решение владельца 05.11.2026): итог окна
 * словами и «С кем поработать» — менеджеры от слабого к сильному со
 * звонками-примерами. Чистые функции: вёрстка только раскладывает строки.
 */

const T = AI_PULSE_TEXT;

/** Разница с отделом, которую считаем заметной: 2 п.п. доли. */
export const AI_PULSE_COACH_MARGIN = 0.02;

/** Разница с прошлым окном, которую называем «лучше / хуже»: 3 п.п. */
export const AI_PULSE_TREND_MARGIN_PCT = 3;

/**
 * «Лучший результат» только при заметном числе договорённостей (решение
 * владельца 09.11.2026: «1 из 11, 9 %» лучшим не называть): звонков с датой
 * не меньше AI_PULSE_BEST_MIN_HITS или доля не ниже AI_PULSE_BEST_MIN_SHARE.
 */
export const AI_PULSE_BEST_MIN_HITS = 3;
export const AI_PULSE_BEST_MIN_SHARE = 0.25;

const pctOf = (share: number): number => Math.round(share * 100);

/** Итог окна: заголовок, сравнение с прошлым окном, строка окна. */
export interface AiPulseSummaryView {
    /** null — разговоров мало, доля скрыта (см. few). */
    headline: string | null;
    trend: { text: string; tone: 'better' | 'worse' | 'same' } | null;
    window: string;
    few: boolean;
}

export const aiPulseSummary = (
    pulse: Pick<
        AiPulse,
        'nextStepDateRate' | 'previous' | 'window' | 'analyzedCalls'
    >,
): AiPulseSummaryView => {
    const value = pulse.nextStepDateRate.value;
    const window = T.summary.window(
        pulse.window.from,
        pulse.window.to,
        pulse.window.workdays.length,
        pulse.analyzedCalls,
    );
    if (value === null || value === undefined) {
        return { headline: null, trend: null, window, few: true };
    }
    const n = pulse.nextStepDateRate.n;
    const pct = pctOf(value);
    const prevValue = pulse.previous?.nextStepDateRate.value;
    let trend: AiPulseSummaryView['trend'] = null;
    if (prevValue !== null && prevValue !== undefined) {
        const prev = pctOf(prevValue);
        const diff = pct - prev;
        trend =
            Math.abs(diff) < AI_PULSE_TREND_MARGIN_PCT
                ? { text: T.summary.same(prev), tone: 'same' }
                : diff > 0
                  ? { text: T.summary.better(prev), tone: 'better' }
                  : { text: T.summary.worse(prev), tone: 'worse' };
    }
    return {
        headline: T.summary.headline(
            pct,
            Math.round(value * n),
            n,
            aiPulseRatioWords(value),
        ),
        trend,
        window,
        few: false,
    };
};

export type AiPulseCoachTone = 'below' | 'best' | 'level';

/** Строка «С кем поработать». */
export interface AiPulseCoachRow {
    managerId: string;
    /** «5 из 29 с датой, 17 %»; null — доля скрыта (мало разборов). */
    share: string | null;
    tone: AiPulseCoachTone;
    advice: string;
    /** Ссылки на звонки без даты — разобрать с менеджером. */
    noDateLinks: string[];
    /** Звонок-образец (только у лучшего; бэк выбирает его по оценке разбора). */
    exampleLink: string | null;
    /** Оценка образца 1–10 для подписи ссылки; null — не пришла. */
    exampleScore: number | null;
}

interface AdviceContext {
    noDateLinks: number;
    /** Бэк нашёл звонок-образец: с датой и оценкой, достойной образца. */
    hasExample: boolean;
    /** Выше отдела, но договорённостей слишком мало для «лучшего». */
    topFew: boolean;
}

const adviceOf = (tone: AiPulseCoachTone, ctx: AdviceContext): string => {
    if (tone === 'best') return ctx.hasExample ? T.coach.best : T.coach.bestNoExample;
    if (tone === 'level') return ctx.topFew ? T.coach.topFew : T.coach.level;
    return ctx.noDateLinks > 0 ? T.coach.below(ctx.noDateLinks) : T.coach.belowNoCalls;
};

/**
 * Менеджеры от слабого к сильному (доли без числа — в конце): ниже отдела
 * — с двумя звонками без даты; лучший — заметно выше отдела и с заметным
 * числом договорённостей (AI_PULSE_BEST_MIN_HITS / AI_PULSE_BEST_MIN_SHARE)
 * — с образцом, если бэк нашёл его по оценке разбора.
 */
export const aiPulseCoachRows = (
    pulse: Pick<AiPulse, 'byManager' | 'nextStepDateRate'>,
): AiPulseCoachRow[] => {
    const department = pulse.nextStepDateRate.value ?? null;
    const valueOf = (row: AiPulse['byManager'][number]): number | null =>
        row.nextStepDateRate.value ?? null;
    const ranked = [...pulse.byManager].sort((a, b) => {
        const left = valueOf(a);
        const right = valueOf(b);
        if (left === null || right === null) {
            return left === right ? a.managerId.localeCompare(b.managerId) : left === null ? 1 : -1;
        }
        return left - right || a.managerId.localeCompare(b.managerId);
    });
    const values = ranked.map(valueOf).filter((value): value is number => value !== null);
    const top = values.length ? Math.max(...values) : null;
    let bestTaken = false;

    return ranked.map(row => {
        const value = valueOf(row);
        const hits = value === null ? 0 : Math.round(value * row.analyzed);
        let tone: AiPulseCoachTone = 'level';
        let topFew = false;
        if (value !== null && department !== null) {
            const isTop = !bestTaken && value === top && value > department + AI_PULSE_COACH_MARGIN;
            if (value < department - AI_PULSE_COACH_MARGIN) tone = 'below';
            else if (isTop && (hits >= AI_PULSE_BEST_MIN_HITS || value >= AI_PULSE_BEST_MIN_SHARE)) {
                tone = 'best';
                bestTaken = true;
            } else if (isTop) topFew = true;
        }
        const noDateLinks = (row.examples?.noDate ?? [])
            .map(ref => aiCardLink(ref.link))
            .filter((link): link is string => link !== null);
        const example = tone === 'best' ? (row.examples?.withDate ?? null) : null;
        const exampleLink = example ? aiCardLink(example.link) : null;
        return {
            managerId: row.managerId,
            share: value === null ? null : T.coach.share(hits, row.analyzed, pctOf(value)),
            tone,
            advice: adviceOf(tone, {
                noDateLinks: noDateLinks.length,
                hasExample: example !== null,
                topFew,
            }),
            noDateLinks: tone === 'below' ? noDateLinks : [],
            exampleLink,
            exampleScore: exampleLink ? (example?.score ?? null) : null,
        };
    });
};
