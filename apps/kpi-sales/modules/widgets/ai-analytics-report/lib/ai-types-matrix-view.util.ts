import type { Tone } from '@workspace/april-ui';
import type { AiByTypeWideRow, AiCallType } from '@/modules/entities/ai-analytics/model';
import {
    AI_CALL_TYPE_ALL,
    aiCallTypeTone,
} from '@/modules/entities/ai-analytics/lib/ai-call-types.data';
import type { AiMatrixColumn } from '@/modules/entities/ai-analytics/lib/ai-matrix-table.util';
import type { AiMatrixType } from '@/modules/entities/ai-analytics/lib/ai-types-matrix.util';

/*
 * Представление матриц KPI-вида на вкладке AI (блоки «AI: типы звонков»
 * и «AI: разделы оценки по типу»): чипы-фильтр типов, менеджеры со
 * звонками для вкладок разбивки, выбор типа для матрицы разделов и
 * показатели графиков оценок. Сборка самих таблиц — в lib сущности
 * ai-analytics. Импорты сущности точечные (model / lib): баррел тянет UI,
 * а утилиты — под vitest.
 */

/** Ключи localStorage (usePersistedSelection). */
export const AI_TYPES_MATRIX_HIDDEN_KEY = 'ai-types-matrix-hidden';
export const AI_TYPES_MATRIX_MODE_KEY = 'ai-types-matrix-mode';
export const AI_SECTIONS_MATRIX_TYPE_KEY = 'ai-sections-matrix-type';

/** Показатель графика оценок (корзина, тип звонка либо раздел рубрики). */
export interface AiScoreIndicator {
    code: string;
    name: string;
}

/** Чип типа звонка: подпись и тон по карте портала, hidden — снят фильтром. */
export interface AiTypeChip {
    code: string;
    label: string;
    tone: Tone;
    hidden: boolean;
    /** Подсказка типа вне средней оценки (приглашение на мероприятие). */
    hint?: string;
}

export interface AiTypeChipsState {
    chips: AiTypeChip[];
    /** Сколько типов периода сейчас скрыто (устаревшие коды не считаются). */
    hiddenCount: number;
    /** Общая сноска к помеченным чипам (null — помеченных нет). */
    footnote: string | null;
}

/** Чипы по типам периода; скрытые коды, которых в периоде нет, не учитываются. */
export const buildAiTypeChips = (
    presentTypes: AiMatrixType[],
    hiddenTypes: readonly string[],
    callTypes: AiCallType[],
): AiTypeChipsState => {
    const chips = presentTypes.map(type => ({
        code: type.code,
        label: type.label,
        tone: aiCallTypeTone(type.code, callTypes),
        hidden: hiddenTypes.includes(type.code),
        ...(type.hint ? { hint: type.hint } : {}),
    }));
    return {
        chips,
        hiddenCount: chips.filter(chip => chip.hidden).length,
        footnote: chips.find(chip => chip.hint)?.hint ?? null,
    };
};

/**
 * Менеджеры со звонками за период (n > 0; при callType — только по нему),
 * уникально, в порядке появления — для скрытия пустых секций разбивки.
 */
export const aiMatrixPresentUserIds = (
    rows: AiByTypeWideRow[],
    callType?: string,
): number[] => [
    ...new Set(
        rows
            .filter(
                row =>
                    row.cell.n > 0 &&
                    (callType === undefined ||
                        callType === AI_CALL_TYPE_ALL ||
                        row.cell.callType === callType),
            )
            .map(row => Number(row.managerId)),
    ),
];

/**
 * Тип матрицы разделов: сохранённый, если он есть в периоде; «все типы»
 * всегда допустимы и стоят по умолчанию. null — типов в периоде нет.
 */
export const resolveAiSectionsType = (
    stored: string,
    presentTypes: AiMatrixType[],
): string | null => {
    if (!presentTypes.length) return null;
    if (stored === AI_CALL_TYPE_ALL) return AI_CALL_TYPE_ALL;
    return (
        presentTypes.find(type => type.code === stored)?.code ?? AI_CALL_TYPE_ALL
    );
};

/** Показатели графика оценок: колонки-оценки матрицы (без хвоста продаж). */
export const aiMatrixScoreIndicators = (
    columns: AiMatrixColumn[],
): AiScoreIndicator[] =>
    columns
        .filter(column => !column.plain)
        .map(column => ({ code: column.code, name: column.name }));
