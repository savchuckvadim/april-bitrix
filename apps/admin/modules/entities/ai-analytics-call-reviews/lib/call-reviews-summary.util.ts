import type { StatusTone } from '@workspace/april-ui/tones';
import { CALL_REVIEWS_TEXT } from '../consts/call-reviews.const';
import type { CallReviewsSummary } from '../model';
import { countWithPct, formatDiff, formatScore } from './call-reviews-format.util';

/** Карточка числа сводки. */
export interface SummaryStatView {
    label: string;
    value: string;
    hint?: string;
    tone?: StatusTone;
}

/** Строка таблички «не так»: подпись и число. */
export interface SummaryCountView {
    key: string;
    label: string;
    count: number;
}

/** Сводка, готовая к показу. */
export interface CallReviewsSummaryView {
    stats: SummaryStatView[];
    kinds: SummaryCountView[];
    top: SummaryCountView[];
}

/** С заглавной: «раздел» → «Раздел». */
const capitalize = (text: string): string => `${text.charAt(0).toUpperCase()}${text.slice(1)}`;

/** Тон разницы: руководители заметно строже (≤ −1) — предупреждение. */
const diffTone = (diff: number | null): StatusTone | undefined =>
    diff !== null && diff <= -1 ? 'warning' : undefined;

/** Ответ сводки → карточки чисел, виды «не так» (только ненулевые) и топ пунктов. */
export const toSummaryView = (summary: CallReviewsSummary): CallReviewsSummaryView => ({
    stats: [
        { label: CALL_REVIEWS_TEXT.total, value: String(summary.total) },
        {
            label: CALL_REVIEWS_TEXT.disagree,
            value: countWithPct(summary.disagree, summary.disagreePct),
            tone: summary.disagree > 0 ? 'destructive' : undefined,
        },
        { label: CALL_REVIEWS_TEXT.avgAi, value: formatScore(summary.avgAiScore) },
        { label: CALL_REVIEWS_TEXT.avgLeader, value: formatScore(summary.avgLeaderScore) },
        {
            label: CALL_REVIEWS_TEXT.avgDiff,
            value: formatDiff(summary.avgScoreDiff),
            hint: CALL_REVIEWS_TEXT.avgDiffHint,
            tone: diffTone(summary.avgScoreDiff),
        },
    ],
    kinds: summary.itemKinds
        .filter(kind => kind.count > 0)
        .map(kind => ({ key: kind.kind, label: capitalize(kind.title), count: kind.count })),
    top: summary.topItems.map(item => ({
        key: `${item.kind}:${item.label}`,
        label: `${item.label} (${item.kindTitle})`,
        count: item.count,
    })),
});
