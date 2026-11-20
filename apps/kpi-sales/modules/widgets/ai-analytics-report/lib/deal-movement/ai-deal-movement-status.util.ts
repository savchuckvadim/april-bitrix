import type { Tone } from '@workspace/april-ui';
import {
    AI_DEAL_MOVEMENT_STATUSES,
    isAiDealMovementAlarm,
    type AiDealMovementAlarmStatus,
    type AiDealMovementManagerStatuses,
    type AiDealMovementStatus,
    type AiDealMovementStatusCell,
} from '@/modules/entities/ai-analytics';

/*
 * Статусы движения сделок на экране: тон бэйджа и карточки, токен цвета
 * линии графика, ячейки в постоянном порядке, подписи из ответа сервера.
 */

/** Тон статуса: движется — успех, откатилась — тревога, без внимания — серый. */
export const AI_DM_STATUS_TONE: Record<AiDealMovementStatus, Tone> = {
    rolled_back: 'destructive',
    abandoned: 'neutral',
    stuck: 'warning',
    at_risk: 'info',
    moving: 'success',
};

/** Токен темы для линии статуса на графике (canvas читает его значение). */
export const AI_DM_STATUS_COLOR_TOKEN: Record<AiDealMovementStatus, string> = {
    rolled_back: '--destructive',
    abandoned: '--muted-foreground',
    stuck: '--warning',
    at_risk: '--info',
    moving: '--success',
};

/**
 * Ячейка статуса из набора; нет такой — пустая (0 сделок, сумма неизвестна,
 * подпись — из запасного набора подписей).
 */
export const aiDmCellOf = (
    cells: readonly AiDealMovementStatusCell[],
    status: AiDealMovementStatus,
    titles: ReadonlyMap<AiDealMovementStatus, string> = new Map(),
): AiDealMovementStatusCell =>
    cells.find(cell => cell.status === status) ?? {
        status,
        title: titles.get(status) ?? '',
        count: 0,
        amountSum: null,
    };

/** Все пять статусов в постоянном порядке (порядок важности бэка). */
export const aiDmOrderedCells = (
    cells: readonly AiDealMovementStatusCell[],
    titles?: ReadonlyMap<AiDealMovementStatus, string>,
): AiDealMovementStatusCell[] =>
    AI_DEAL_MOVEMENT_STATUSES.map(status => aiDmCellOf(cells, status, titles));

/** Подписи статусов из ответа сервера: код → «Без продвижения». */
export const aiDmStatusTitles = (
    cells: readonly AiDealMovementStatusCell[],
): Map<AiDealMovementStatus, string> =>
    new Map(
        cells
            .filter(cell => cell.title.trim().length > 0)
            .map(cell => [cell.status, cell.title] as const),
    );

/** Тревожные ячейки — варианты фильтра «Статус» списка проблемных сделок. */
export const aiDmAlarmCells = (
    cells: readonly AiDealMovementStatusCell[],
): (AiDealMovementStatusCell & { status: AiDealMovementAlarmStatus })[] =>
    aiDmOrderedCells(cells).filter(
        (cell): cell is AiDealMovementStatusCell & {
            status: AiDealMovementAlarmStatus;
        } => isAiDealMovementAlarm(cell.status) && cell.title.length > 0,
    );

/** Менеджеры: больше проблемных сделок — выше, при равенстве — больше сумма, потом имя. */
export const aiDmSortManagers = <T extends AiDealMovementManagerStatuses>(
    managers: readonly T[],
): T[] =>
    [...managers].sort(
        (a, b) =>
            b.problemCount - a.problemCount ||
            b.problemAmountSum - a.problemAmountSum ||
            (a.managerName ?? a.managerId).localeCompare(
                b.managerName ?? b.managerId,
                'ru',
            ),
    );
