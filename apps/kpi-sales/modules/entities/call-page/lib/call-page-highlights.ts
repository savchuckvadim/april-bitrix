/**
 * Подсветки расшифровки: группировка по видам (бейджи), какие реплики
 * выделять при выборе вида или одной подсветки, какая реплика звучит сейчас.
 * Привязку подсветок к репликам делает сервер — здесь только раскладка.
 */
import type {
    CallPageHighlightDto,
    CallPageHighlightGroup,
    CallPageSegmentDto,
    CallPageSelection,
    CallPageTone,
} from '../model/types';
import { worseTone } from './call-page-tone';

/** Подсветки по видам, в порядке первого появления. */
export function groupHighlights(
    highlights: readonly CallPageHighlightDto[],
): CallPageHighlightGroup[] {
    const groups = new Map<string, CallPageHighlightGroup>();
    for (const highlight of highlights) {
        const group = groups.get(highlight.kind);
        if (group) {
            group.items.push(highlight);
            group.tone = worseTone(group.tone, highlight.tone);
        } else {
            groups.set(highlight.kind, {
                kind: highlight.kind,
                title: highlight.kindTitle,
                tone: highlight.tone,
                items: [highlight],
            });
        }
    }
    return [...groups.values()];
}

/** Подсветки, которые сейчас выделены: одна выбранная либо весь вид. */
export function selectedHighlights(
    highlights: readonly CallPageHighlightDto[],
    selection: CallPageSelection,
): CallPageHighlightDto[] {
    if (selection.highlightId !== null) {
        return highlights.filter(item => item.id === selection.highlightId);
    }
    if (selection.kind !== null) {
        return highlights.filter(item => item.kind === selection.kind);
    }
    return [];
}

/** Окраска реплик под выделенными подсветками: на реплике — самая тревожная. */
export function segmentTones(
    selected: readonly CallPageHighlightDto[],
): Map<number, CallPageTone> {
    const tones = new Map<number, CallPageTone>();
    for (const highlight of selected) {
        for (const index of highlight.segmentIndexes) {
            const current = tones.get(index);
            tones.set(
                index,
                current === undefined
                    ? highlight.tone
                    : worseTone(current, highlight.tone),
            );
        }
    }
    return tones;
}

/** Подписи выделенных подсветок у реплики, с которой подсветка начинается. */
export function segmentLabels(
    selected: readonly CallPageHighlightDto[],
): Map<number, CallPageHighlightDto[]> {
    const labels = new Map<number, CallPageHighlightDto[]>();
    for (const highlight of selected) {
        const first = highlight.segmentIndexes[0];
        if (first === undefined) continue;
        labels.set(first, [...(labels.get(first) ?? []), highlight]);
    }
    return labels;
}

/** Номер реплики, которая звучит на этой секунде; времени у реплик нет — null. */
export function playingSegmentIndex(
    transcript: readonly CallPageSegmentDto[],
    currentSec: number | null,
): number | null {
    if (currentSec === null) return null;
    let playing: number | null = null;
    for (const segment of transcript) {
        if (segment.startSec === null) return null;
        if (segment.startSec > currentSec) break;
        playing = segment.index;
    }
    return playing;
}

/** Есть ли подсветке что показать: место в расшифровке или секунда записи. */
export const isHighlightReachable = (
    highlight: CallPageHighlightDto,
    hasAudio: boolean,
): boolean =>
    highlight.segmentIndexes.length > 0 ||
    (hasAudio && highlight.startSec !== null);
