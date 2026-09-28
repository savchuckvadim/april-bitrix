import type { Tone } from '@workspace/april-ui';
import type {
    AiByTypeWideRow,
    AiCallType,
    AiTypeTotals,
} from '@/modules/entities/ai-analytics/model';
import { aiCallTypeTone } from '@/modules/entities/ai-analytics/lib/ai-call-types.data';
import type { AiMatrixType } from '@/modules/entities/ai-analytics/lib/ai-types-matrix.util';
import {
    AI_SECTIONS_MATRIX_ALL,
    type AiMatrixSection,
} from '@/modules/entities/ai-analytics/lib/ai-sections-matrix.util';

/*
 * Представление матриц KPI-вида на вкладке AI (блоки «AI: типы звонков»
 * и «AI: разделы оценки по типу»): чипы-фильтр типов,
 * менеджеры со звонками для вкладок разбивки, итоги по видимым типам,
 * выбор типа для матрицы разделов и показатели графиков оценок.
 * Сборка самих таблиц/датасетов — в lib сущности ai-analytics. Импорты
 * сущности точечные (model / lib): баррел тянет UI, а утилиты — под vitest.
 */

export const AI_MATRIX_EMPTY_TEXT =
    'За период разобранных звонков в периметре нет';
export const AI_MATRIX_SECTION_EMPTY_TEXT = 'Нет данных за период';

/** Ключи localStorage (usePersistedSelection). */
export const AI_TYPES_MATRIX_HIDDEN_KEY = 'ai-types-matrix-hidden';
export const AI_SECTIONS_MATRIX_TYPE_KEY = 'ai-sections-matrix-type';

/** Показатель графика оценок (тип звонка либо раздел рубрики). */
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
}

export interface AiTypeChipsState {
    chips: AiTypeChip[];
    /** Сколько типов периода сейчас скрыто (устаревшие коды не считаются). */
    hiddenCount: number;
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
    }));
    return { chips, hiddenCount: chips.filter(chip => chip.hidden).length };
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
                    (callType === undefined || row.cell.callType === callType),
            )
            .map(row => Number(row.managerId)),
    ),
];

/** Итоги по типам к строке «Итого по типам»: только видимые типы со звонками, порядок бэка. */
export const aiMatrixVisibleTotals = (
    totals: AiTypeTotals[] | null,
    visibleTypes: AiMatrixType[],
): AiTypeTotals[] => {
    const codes = new Set(visibleTypes.map(type => type.code));
    return (totals ?? []).filter(
        total => total.n > 0 && codes.has(total.callType),
    );
};

/** Тип матрицы разделов: сохранённый, если он есть в периоде, иначе первый; null — типов нет. */
export const resolveAiSectionsType = (
    stored: string,
    presentTypes: AiMatrixType[],
): string | null =>
    presentTypes.find(type => type.code === stored)?.code ??
    presentTypes[0]?.code ??
    null;

/** Показатели графика оценок блока типов: видимые типы. */
export const aiTypesScoreIndicators = (
    types: AiMatrixType[],
): AiScoreIndicator[] =>
    types.map(type => ({ code: type.code, name: type.label }));

/** Показатели графика оценок блока разделов: разделы типа + «Все разборы». */
export const aiSectionsScoreIndicators = (
    sections: AiMatrixSection[],
): AiScoreIndicator[] => [
    ...sections.map(section => ({
        code: section.code,
        name: section.title,
    })),
    AI_SECTIONS_MATRIX_ALL,
];
