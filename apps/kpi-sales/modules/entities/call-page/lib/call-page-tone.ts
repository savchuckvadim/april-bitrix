import type { StatusTone } from '@workspace/april-ui/tones';
import type { CallPageSpeaker, CallPageTone } from '../model/types';

/** Окраска страницы звонка → тон дизайн-системы. */
export const CALL_PAGE_BADGE_TONE: Record<CallPageTone, StatusTone> = {
    good: 'success',
    bad: 'destructive',
    warn: 'warning',
    neutral: 'neutral',
};

/**
 * Подсветка реплики: подложка и кромка слева. Классы — литералами целиком,
 * Tailwind склеенную строку не увидит.
 */
export const CALL_PAGE_SEGMENT_CLASS: Record<CallPageTone, string> = {
    good: 'border-l-success bg-success/10',
    bad: 'border-l-destructive bg-destructive/10',
    warn: 'border-l-warning bg-warning/15',
    neutral: 'border-l-primary bg-primary/10',
};

/** Цвет текста значения в «Итогах разговора». */
export const CALL_PAGE_TEXT_CLASS: Record<CallPageTone, string> = {
    good: 'text-success',
    bad: 'text-destructive',
    warn: 'text-warning',
    neutral: 'text-foreground',
};

/** Чем тревожнее окраска, тем больше вес: её и показываем на реплике. */
const TONE_WEIGHT: Record<CallPageTone, number> = {
    bad: 3,
    warn: 2,
    good: 1,
    neutral: 0,
};

/** Более тревожная из двух окрасок. */
export const worseTone = (a: CallPageTone, b: CallPageTone): CallPageTone =>
    TONE_WEIGHT[b] > TONE_WEIGHT[a] ? b : a;

export const CALL_PAGE_SPEAKER_TITLE: Record<CallPageSpeaker, string> = {
    manager: 'Менеджер',
    client: 'Клиент',
};

/** Оценка 1–10 → тон: от 7 — хорошо, от 5 — средне, ниже — плохо. */
export function scoreTone(score: number | null | undefined): StatusTone {
    if (score === null || score === undefined) return 'neutral';
    if (score >= 7) return 'success';
    return score >= 5 ? 'warning' : 'destructive';
}
