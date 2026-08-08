import type { MouseEvent } from 'react';

/** Индекс сегмента по доле ширины трека: 0..1 → 0..total-1. */
export const segmentIndexAt = (ratio: number, total: number): number =>
    Math.max(0, Math.min(total - 1, Math.floor(ratio * total)));

/**
 * Стадия под курсором на полоске: позиция мыши относительно трека → номер
 * сегмента. -1 — когда считать не от чего (нет ширины или стадий).
 */
export const segmentIndexFromPointer = (
    event: MouseEvent<HTMLElement>,
    total: number,
): number => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width || total <= 0) return -1;
    return segmentIndexAt((event.clientX - rect.left) / rect.width, total);
};
