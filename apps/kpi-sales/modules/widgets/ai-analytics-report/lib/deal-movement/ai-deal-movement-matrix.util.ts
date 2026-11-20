import {
    AI_DEAL_MOVEMENT_BUY_ANYWAY,
    type AiDealMovementMatrix,
    type AiDealMovementMatrixBlock,
    type AiDealMovementMatrixCell,
    type AiDealMovementScoreBandInfo,
} from '@/modules/entities/ai-analytics';
import { aiDmCalls } from './ai-deal-movement-format.util';

/*
 * Тепловая матрица «оценка звонка × продвижение сделки»: строки — полосы
 * оценки (подписи с сервера), столбцы — продвижение 1–5, в клетке — число
 * звонков. Насыщенность — доля от самой полной клетки; клетка «клиент
 * купил бы и без менеджера» подсвечена отдельно. Числа видны всегда, даже
 * при «мало звонков».
 */

export const AI_DM_MATRIX_MODES = ['department', 'manager'] as const;
export type AiDmMatrixMode = (typeof AI_DM_MATRIX_MODES)[number];

export const isAiDmMatrixMode = (value: string): value is AiDmMatrixMode =>
    (AI_DM_MATRIX_MODES as readonly string[]).includes(value);

/** Насыщенность клетки по уровням 0–5 — классы токена темы целиком (Tailwind видит литералы). */
export const AI_DM_HEAT_CLASSES = [
    '',
    'bg-info/5',
    'bg-info/10',
    'bg-info/20',
    'bg-info/30',
    'bg-info/40',
] as const;

const HEAT_LEVELS = AI_DM_HEAT_CLASSES.length - 1;

/** Уровень насыщенности: 0 — пусто, иначе 1..5 по доле от максимума. */
export const aiDmHeatLevel = (count: number, max: number): number =>
    count <= 0 || max <= 0
        ? 0
        : Math.min(HEAT_LEVELS, Math.max(1, Math.ceil((count / max) * HEAT_LEVELS)));

export interface AiDmMatrixViewCell {
    progress: number;
    count: number;
    /** Клетка «клиент купил бы и без менеджера». */
    flagged: boolean;
    flagTitle: string | null;
    heatClass: string;
    /** Подсказка: «6 звонков · Низкая оценка (1–4) · продвижение 4». */
    hint: string;
}

export interface AiDmMatrixViewRow {
    band: AiDealMovementScoreBandInfo;
    cells: AiDmMatrixViewCell[];
}

const cellOf = (
    cells: readonly AiDealMovementMatrixCell[],
    band: AiDealMovementScoreBandInfo,
    progress: number,
): AiDealMovementMatrixCell | null =>
    cells.find(
        cell => cell.scoreBand === band.code && cell.progress === progress,
    ) ?? null;

/** Строки матрицы в порядке полос и уровней сервера; пустая клетка — ноль. */
export const aiDmMatrixRows = (
    block: Pick<AiDealMovementMatrixBlock, 'bands' | 'progressLevels'>,
    matrix: Pick<AiDealMovementMatrix, 'cells'>,
): AiDmMatrixViewRow[] => {
    const max = Math.max(0, ...matrix.cells.map(cell => cell.count));
    return block.bands.map(band => ({
        band,
        cells: block.progressLevels.map(progress => {
            const cell = cellOf(matrix.cells, band, progress);
            const count = cell?.count ?? 0;
            const flagged = cell?.flag === AI_DEAL_MOVEMENT_BUY_ANYWAY;
            const flagTitle = flagged ? (cell?.flagTitle ?? null) : null;
            return {
                progress,
                count,
                flagged,
                flagTitle,
                heatClass: AI_DM_HEAT_CLASSES[aiDmHeatLevel(count, max)] ?? '',
                hint: [aiDmCalls(count), band.title, `продвижение ${progress}`, flagTitle]
                    .filter(Boolean)
                    .join(' · '),
            };
        }),
    }));
};

/** Подпись пометки «клиент купил бы и без менеджера» — из клеток сервера. */
export const aiDmBuyAnywayTitle = (
    matrix: Pick<AiDealMovementMatrix, 'cells'>,
): string | null =>
    matrix.cells.find(
        cell => cell.flag === AI_DEAL_MOVEMENT_BUY_ANYWAY && cell.flagTitle,
    )?.flagTitle ?? null;

/** Итог под матрицей: «В матрице 54 звонка · клиент купил бы и без менеджера: 3». */
export const aiDmMatrixSummary = (matrix: AiDealMovementMatrix): string => {
    const parts = [`В матрице ${aiDmCalls(matrix.n)}`];
    const title = aiDmBuyAnywayTitle(matrix);
    if (title && matrix.buyAnyway > 0) parts.push(`${title}: ${matrix.buyAnyway}`);
    return parts.join(' · ');
};

/** «Ещё 2 звонка с продвижением, но без оценки — в матрицу не попали»; 0 — null. */
export const aiDmNoScoreText = (noScore: number): string | null =>
    noScore > 0
        ? `Ещё ${aiDmCalls(noScore)} с продвижением, но без оценки — в матрицу не попали.`
        : null;

/**
 * Какую матрицу показать: отдел или выбранного менеджера (не выбран или
 * пропал из ответа — первый в списке, у него больше всего звонков).
 */
export const aiDmPickMatrix = (
    block: Pick<AiDealMovementMatrixBlock, 'department' | 'managers'>,
    mode: AiDmMatrixMode,
    managerId: string | null,
): { matrix: AiDealMovementMatrix | null; managerId: string | null } => {
    if (mode === 'department') {
        return { matrix: block.department, managerId: null };
    }
    const manager =
        block.managers.find(item => item.managerId === managerId) ??
        block.managers[0] ??
        null;
    return { matrix: manager, managerId: manager?.managerId ?? null };
};
