import type { Tone } from '@workspace/april-ui';
import type { AiManagerRow } from '@/modules/entities/ai-analytics/model';
import {
    AI_LEVER_LABELS,
    isAiLever,
} from '@/modules/entities/ai-analytics/lib/ai-feedback.util';

/*
 * Вид совета в строке обзора (подпись, тон, единица стоимости) и уровень
 * доказательности словами. Незнакомый код с бэка — нейтральная подпись,
 * а не падение строки. Без React — vitest.
 */

type AiRecommendationItem = AiManagerRow['recommendations'][number];
export type AiRecommendationLever = AiRecommendationItem['lever'];
export type AiRecommendationEvidence = AiRecommendationItem['evidence'];

export interface AiLeverView {
    label: string;
    tone: Tone;
    costUnit: string;
}

const COACHING = 'ч коучинга';

const leverView = (
    lever: AiRecommendationLever,
    tone: Tone,
    costUnit: string,
): AiLeverView => ({ label: AI_LEVER_LABELS[lever], tone, costUnit });

/** Вид совета: подпись, тон, единица стоимости (volume — минуты активности, остальные — часы). */
export const AI_LEVER: Record<AiRecommendationLever, AiLeverView> = {
    volume: leverView('volume', 'info', 'мин активности'),
    quality: leverView('quality', 'primary', COACHING),
    checklist: leverView('checklist', 'accent', COACHING),
    pipeline: leverView('pipeline', 'secondary', 'ч'),
    objection: leverView('objection', 'warning', COACHING),
};

/** Вид совета, которого фронт ещё не знает. */
export const AI_LEVER_UNKNOWN: AiLeverView = {
    label: 'Совет',
    tone: 'muted',
    costUnit: 'ч',
};

/** Вид совета по коду с бэка; незнакомый — «Совет». */
export const aiLeverView = (lever: string): AiLeverView =>
    isAiLever(lever) ? AI_LEVER[lever] : AI_LEVER_UNKNOWN;

/** Уровень доказательности совета — словами, без кода уровня. */
export const AI_EVIDENCE: Record<AiRecommendationEvidence, string> = {
    E0: 'факт с интервалом',
    E1: 'связь в данных',
    E2: 'данные нескольких порталов',
    E3: 'проверено экспериментом',
};

export const AI_EVIDENCE_UNKNOWN = 'не указана';

const isAiEvidence = (code: string): code is AiRecommendationEvidence =>
    Object.prototype.hasOwnProperty.call(AI_EVIDENCE, code);

/** Доказательность словами; незнакомый уровень — «не указана». */
export const aiEvidenceWords = (code: string): string =>
    isAiEvidence(code) ? AI_EVIDENCE[code] : AI_EVIDENCE_UNKNOWN;
