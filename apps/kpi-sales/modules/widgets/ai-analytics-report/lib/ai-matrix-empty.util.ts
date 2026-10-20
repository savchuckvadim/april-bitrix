import type { AiMatrixCoverageReason } from '@/modules/entities/ai-analytics/lib/ai-matrix-coverage.util';
import { AI_MATRIX_BLOCK_TEXT } from './ai-matrix-texts';

/*
 * Пустое состояние матриц: причина словами и действие. Факты — из
 * ai-matrix-coverage.util сущности, тексты — из словаря блока.
 */

export type AiMatrixEmptyAction =
    | { kind: 'show-from'; label: string; date: string }
    | { kind: 'add-to-filter'; label: string; managerIds: string[] };

export interface AiMatrixEmptyView {
    text: string;
    /** Вторая строка: что ещё можно сделать (без кнопки). */
    note: string | null;
    action: AiMatrixEmptyAction | null;
}

const T = AI_MATRIX_BLOCK_TEXT.empty;

export const aiMatrixEmptyView = (
    reason: AiMatrixCoverageReason,
    managerName: (id: string) => string,
): AiMatrixEmptyView => {
    switch (reason.kind) {
        case 'disabled':
            return { text: T.disabled, note: null, action: null };
        case 'before-analysis':
            return { text: T.beforeAnalysis(reason.since), note: null, action: null };
        case 'pilot-outside-filter':
            return {
                text: T.pilotOutside(reason.pilotIds.map(managerName).join(', ')),
                note: T.pilotWiden,
                action: {
                    kind: 'add-to-filter',
                    label: T.addToFilter,
                    managerIds: reason.pilotIds,
                },
            };
        case 'before-comparable':
            return {
                text: T.beforeComparable(reason.count, reason.comparableFrom),
                note: reason.canShowFrom ? null : T.beforeComparableFix,
                action: reason.canShowFrom
                    ? {
                          kind: 'show-from',
                          label: T.showFrom(reason.comparableFrom),
                          date: reason.comparableFrom,
                      }
                    : null,
            };
        case 'short':
            return { text: T.short(reason.minDurationSec), note: null, action: null };
        case 'no-type':
            return { text: T.noType(reason.count), note: null, action: null };
        default:
            return { text: T.none(reason.minDurationSec), note: null, action: null };
    }
};
