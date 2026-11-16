import type { CatalogEntry } from '../model';
import {
    METHODOLOGY_PREVIEW_TEXT,
    type MethodologyPreviewResult,
    type PreviewCap,
    type PreviewCheckpoint,
    type PreviewCheckpointStatus,
} from '../model/methodology-preview';

const T = METHODOLOGY_PREVIEW_TEXT;

export type PreviewTone = 'success' | 'warning' | 'muted';

export interface PreviewCheckpointView {
    code: string;
    title: string;
    statusLabel: string;
    tone: PreviewTone;
    /** «необязательный», «посчитан по фактам разбора». */
    notes: string[];
    /** «01:14 — „цитата“»; null — цитаты нет. */
    quote: string | null;
}

export interface MethodologyPreviewView {
    /** Методика применима к типу звонка. */
    applicable: boolean;
    /** Строки сводки: тип звонка, пункты, спирали, оценка. */
    summary: string[];
    checkpoints: PreviewCheckpointView[];
    caps: string[];
    usage: string | null;
}

const STATUS: Record<PreviewCheckpointStatus, { label: string; tone: PreviewTone }> = {
    done: { label: T.statusDone, tone: 'success' },
    missed: { label: T.statusMissed, tone: 'warning' },
    not_applicable: { label: T.statusNotApplicable, tone: 'muted' },
};

/** Секунда звонка → «мм:сс». */
export const clock = (seconds: number): string => {
    const total = Math.max(0, Math.round(seconds));
    const pad = (value: number): string => String(value).padStart(2, '0');
    return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
};

const scoreText = (score: number | null): string =>
    score === null ? T.noScore : String(score);

const titleOf = (entries: readonly CatalogEntry[], code: string): string =>
    entries.find(entry => entry.code === code)?.title ?? code;

function toCheckpointView(checkpoint: PreviewCheckpoint): PreviewCheckpointView {
    const status = STATUS[checkpoint.status];
    const notes: string[] = [];
    if (!checkpoint.mandatory) notes.push(T.optional);
    if (checkpoint.source === 'rule') notes.push(T.byRule);
    const quote = checkpoint.quote
        ? `${checkpoint.startSec === null ? '' : `${clock(checkpoint.startSec)} — `}«${checkpoint.quote}»`
        : null;
    return {
        code: checkpoint.code,
        title: checkpoint.title,
        statusLabel: status.label,
        tone: status.tone,
        notes,
        quote,
    };
}

function capLine(cap: PreviewCap, sections: readonly CatalogEntry[]): string {
    const target =
        cap.target === 'total' ? T.targetTotal : titleOf(sections, cap.target);
    return cap.applied
        ? T.capApplied(cap.title, target, scoreText(cap.before), scoreText(cap.after))
        : T.capNotApplied(cap.title, target, cap.max);
}

/**
 * Итог проверки → строки вкладки. Типы звонков и разделы подписываются
 * названиями из каталога формы.
 */
export function toMethodologyPreviewView(
    result: MethodologyPreviewResult,
    callTypes: readonly CatalogEntry[],
    sections: readonly CatalogEntry[],
): MethodologyPreviewView {
    const summary: string[] = [];
    if (result.callType) {
        summary.push(T.callType(titleOf(callTypes, result.callType)));
    }
    const outcome = result.methodology;
    if (!result.applicable || !outcome) {
        return { applicable: false, summary, checkpoints: [], caps: [], usage: null };
    }
    summary.push(T.checkpoints(outcome.checkpointsDone, outcome.checkpointsTotal));
    if (outcome.spiralsFull !== null && outcome.spiralsMinFull !== null) {
        summary.push(T.spirals(outcome.spiralsFull, outcome.spiralsMinFull));
    }
    summary.push(
        result.scoreBefore === result.scoreAfter
            ? T.scoreSame(scoreText(result.scoreAfter))
            : T.score(scoreText(result.scoreBefore), scoreText(result.scoreAfter)),
    );
    return {
        applicable: true,
        summary,
        checkpoints: outcome.checkpoints.map(toCheckpointView),
        caps: result.capsTriggered.map(cap => capLine(cap, sections)),
        usage: T.usage(
            result.model,
            result.tokens === null ? null : result.tokens.toLocaleString('ru-RU'),
        ),
    };
}
