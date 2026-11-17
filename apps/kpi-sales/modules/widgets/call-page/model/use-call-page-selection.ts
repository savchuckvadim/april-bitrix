'use client';

import * as React from 'react';
import {
    allHighlights,
    groupHighlights,
    playingSegmentIndex,
    segmentLabels,
    segmentTones,
    selectedHighlights,
    type CallPageDto,
    type CallPageHighlightDto,
    type CallPageHighlightKind,
    type CallPageSegmentDto,
    type CallPageSelection,
} from '@/modules/entities/call-page';

/** Запрос плееру: поставить запись на секунду (key растёт на каждый запрос). */
export interface CallPageSeek {
    time: number;
    key: number;
}

const NOTHING: CallPageSelection = { kind: null, highlightId: null };

/**
 * Состояние страницы звонка: что выделено в расшифровке, куда поставить
 * запись, какая реплика звучит. Компоненты получают готовые значения и
 * обработчики.
 */
export function useCallPageSelection(data: CallPageDto) {
    const [selection, setSelection] = React.useState<CallPageSelection>(NOTHING);
    const [seek, setSeek] = React.useState<CallPageSeek | null>(null);
    const [currentSec, setCurrentSec] = React.useState<number | null>(null);
    /** Реплика, к которой нужно прокрутить расшифровку. */
    const [focusIndex, setFocusIndex] = React.useState<number | null>(null);

    /** Бейджевые подсветки и подсветки разделов — для поиска по id. */
    const highlights = React.useMemo(
        () =>
            allHighlights({
                highlights: data.highlights,
                sectionHighlights: data.sectionHighlights,
            }),
        [data.highlights, data.sectionHighlights],
    );
    // Бейджи — только из highlights: разделы группой не выводятся.
    const groups = React.useMemo(
        () => groupHighlights(data.highlights),
        [data.highlights],
    );
    const selected = React.useMemo(
        () => selectedHighlights(highlights, selection),
        [highlights, selection],
    );
    const tones = React.useMemo(() => segmentTones(selected), [selected]);
    const labels = React.useMemo(() => segmentLabels(selected), [selected]);
    const playingIndex = React.useMemo(
        () => playingSegmentIndex(data.transcript, currentSec),
        [data.transcript, currentSec],
    );

    const seekTo = React.useCallback(
        (time: number | null) => {
            if (time === null || !data.call.hasAudio) return;
            setSeek(previous => ({ time, key: (previous?.key ?? 0) + 1 }));
        },
        [data.call.hasAudio],
    );

    /** Бейдж вида: выделить все его места; повторное нажатие снимает. */
    const toggleKind = React.useCallback(
        (kind: CallPageHighlightKind) => {
            const off = selection.kind === kind && selection.highlightId === null;
            setSelection(off ? NOTHING : { kind, highlightId: null });
            if (off) return;
            const first = data.highlights.find(
                item => item.kind === kind && item.segmentIndexes.length > 0,
            );
            setFocusIndex(first?.segmentIndexes[0] ?? null);
        },
        [data.highlights, selection],
    );

    /** Одна подсветка: выделить, прокрутить к ней и включить запись с этого места. */
    const openHighlight = React.useCallback(
        (highlight: CallPageHighlightDto) => {
            setSelection({ kind: highlight.kind, highlightId: highlight.id });
            setFocusIndex(highlight.segmentIndexes[0] ?? null);
            seekTo(highlight.startSec);
        },
        [seekTo],
    );

    const openHighlightById = React.useCallback(
        (id: string | null) => {
            const highlight = highlights.find(item => item.id === id);
            if (highlight) openHighlight(highlight);
        },
        [highlights, openHighlight],
    );

    /** Нажатие на реплику: слушать с неё. */
    const openSegment = React.useCallback(
        (segment: CallPageSegmentDto) => seekTo(segment.startSec),
        [seekTo],
    );

    const clear = React.useCallback(() => setSelection(NOTHING), []);

    return {
        groups,
        selection,
        tones,
        labels,
        seek,
        focusIndex,
        playingIndex,
        setCurrentSec,
        toggleKind,
        openHighlight,
        openHighlightById,
        openSegment,
        clear,
    };
}

export type CallPageSelectionState = ReturnType<typeof useCallPageSelection>;
