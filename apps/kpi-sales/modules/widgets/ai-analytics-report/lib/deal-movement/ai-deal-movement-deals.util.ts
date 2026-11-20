import type { MultiComboboxOption, MicroSelectOption } from '@workspace/april-ui';
import {
    AI_DEAL_MOVEMENT_DEFAULT_PAGE_SIZE,
    isAiDealMovementAlarm,
    type AiDealMovementAlarmStatus,
    type AiDealMovementDealsGroup,
    type AiDealMovementDealsQuery,
    type AiDealMovementStatus,
    type AiDealMovementStatusCell,
} from '@/modules/entities/ai-analytics';
import { AI_DEAL_MOVEMENT_TEXT } from './ai-deal-movement.texts';
import { aiDmAlarmCells } from './ai-deal-movement-status.util';

/*
 * Список проблемных сделок: фильтр (менеджер, статусы, страница), тело
 * запроса, варианты фильтров и подпись «показаны 30 из 48» по группам.
 * Отбор, порядок и страницы считает сервер — здесь только состояние
 * фильтра и подписи.
 */

const T = AI_DEAL_MOVEMENT_TEXT.deals;

/** Значение селекта «Все менеджеры». */
export const AI_DM_ALL_MANAGERS = 'all';

/** Сколько групп «показаны не все» перечислять, остальные — числом. */
export const AI_DM_LIMITED_LINES_MAX = 6;

export interface AiDmDealsFilter {
    /** Выбранный менеджер; null — все в границах фильтра отчёта. */
    managerId: string | null;
    /** Выбранные статусы; пусто — все тревожные. */
    statuses: AiDealMovementAlarmStatus[];
    page: number;
    pageSize: number;
}

export const AI_DM_DEALS_FILTER_DEFAULT: AiDmDealsFilter = {
    managerId: null,
    statuses: [],
    page: 1,
    pageSize: AI_DEAL_MOVEMENT_DEFAULT_PAGE_SIZE,
};

/** Менеджер из таблицы или селекта: «все» — сброс; страница — первая. */
export const aiDmWithManager = (
    filter: AiDmDealsFilter,
    value: string | null,
): AiDmDealsFilter => ({
    ...filter,
    managerId: value && value !== AI_DM_ALL_MANAGERS ? value : null,
    page: 1,
});

/** Статусы из мультивыбора: незнакомые коды отбрасываются; страница — первая. */
export const aiDmWithStatuses = (
    filter: AiDmDealsFilter,
    values: readonly string[],
): AiDmDealsFilter => ({
    ...filter,
    statuses: values.filter(isAiDealMovementAlarm),
    page: 1,
});

export const aiDmWithPage = (
    filter: AiDmDealsFilter,
    page: number,
): AiDmDealsFilter => ({ ...filter, page: Math.max(1, Math.floor(page)) });

export const aiDmWithPageSize = (
    filter: AiDmDealsFilter,
    pageSize: number,
): AiDmDealsFilter => ({ ...filter, pageSize, page: 1 });

/** Фильтр отличается от исходного — показать «Сбросить фильтры». */
export const aiDmHasDealsFilter = (filter: AiDmDealsFilter): boolean =>
    filter.managerId !== null || filter.statuses.length > 0;

/**
 * Тело запроса: выбранный менеджер, иначе менеджеры фильтра отчёта
 * (пусто — все, кого видно); статусы — только если выбраны.
 */
export const aiDmDealsQuery = (
    filter: AiDmDealsFilter,
    scopeManagerIds: readonly string[],
): AiDealMovementDealsQuery => {
    const managerIds = filter.managerId
        ? [filter.managerId]
        : [...scopeManagerIds];
    return {
        ...(managerIds.length ? { managerIds } : {}),
        ...(filter.statuses.length ? { statuses: [...filter.statuses] } : {}),
        page: filter.page,
        pageSize: filter.pageSize,
    };
};

/**
 * Варианты «Менеджер»: «Все менеджеры» и менеджеры обзора; выбранного нет
 * среди них (обзор ещё грузится) — он добавляется, чтобы селект его показал.
 */
export const aiDmManagerOptions = (
    managerIds: readonly string[],
    selectedId: string | null,
    nameOf: (managerId: string) => string,
): MicroSelectOption[] => {
    const ids =
        selectedId && !managerIds.includes(selectedId)
            ? [...managerIds, selectedId]
            : managerIds;
    return [
        { value: AI_DM_ALL_MANAGERS, label: T.managerAll },
        ...ids.map(managerId => ({ value: managerId, label: nameOf(managerId) })),
    ];
};

/**
 * Подписи статусов для списка: из обзора, а чего там нет — из строк самого
 * списка (statusTitle). Свои подписи не придумываем.
 */
export const aiDmDealsTitles = (
    cells: readonly AiDealMovementStatusCell[],
    items: readonly { status: AiDealMovementStatus; statusTitle: string }[],
): Map<AiDealMovementStatus, string> => {
    const titles = new Map<AiDealMovementStatus, string>();
    for (const cell of cells) {
        if (cell.title.trim()) titles.set(cell.status, cell.title);
    }
    for (const item of items) {
        if (!titles.has(item.status) && item.statusTitle.trim()) {
            titles.set(item.status, item.statusTitle);
        }
    }
    return titles;
};

/** Варианты «Статус»: тревожные статусы с подписью сервера и числом сделок. */
export const aiDmStatusOptions = (
    cells: readonly AiDealMovementStatusCell[],
): MultiComboboxOption[] =>
    aiDmAlarmCells(cells).map(cell => ({
        value: cell.status,
        label: cell.title,
        hint: String(cell.count),
    }));

export interface AiDmLimitedNote {
    lines: string[];
    /** Сколько групп не перечислено. */
    rest: number;
}

/**
 * Группы, где показаны не все сделки: «Иванова Анна · Без внимания —
 * показаны 30 из 48». Больше max — первые max строк и остаток числом.
 */
export const aiDmLimitedNote = (
    groups: readonly AiDealMovementDealsGroup[],
    nameOf: (managerId: string | null) => string,
    titles: ReadonlyMap<AiDealMovementStatus, string>,
    max: number = AI_DM_LIMITED_LINES_MAX,
): AiDmLimitedNote => {
    const lines = groups
        .filter(group => group.total > group.shown)
        .map(group => {
            const title = titles.get(group.status);
            const who = title
                ? `${nameOf(group.managerId)} · ${title}`
                : nameOf(group.managerId);
            return `${who} — показаны ${group.shown} из ${group.total}`;
        });
    return {
        lines: lines.slice(0, max),
        rest: Math.max(0, lines.length - max),
    };
};

/** Пояснение к ограничению списка. */
export const aiDmPerGroupText = (perGroup: number): string =>
    `На каждого менеджера и статус в списке не больше ${perGroup} самых крупных по сумме сделок.`;
