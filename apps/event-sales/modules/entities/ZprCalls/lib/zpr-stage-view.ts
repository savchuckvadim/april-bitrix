import type {
    ZprCall,
    ZprCallView,
    ZprStageDict,
    ZprStageDictItem,
} from '../model';

/**
 * Словарь стадий воронки ЗПР и разрезка элементов по нему.
 * Данные отдельно от вёрстки: UI берёт готовые view-модели.
 */

/**
 * ENTITY_ID справочника стадий динамического типа для crm.status.list:
 * `DYNAMIC_{entityTypeId}_STAGE_{categoryId}`.
 */
export const zprStageEntityId = (
    entityTypeId: number,
    categoryId: number,
): string => `DYNAMIC_${entityTypeId}_STAGE_${categoryId}`;

/** Сырая строка crm.status.list (нужные поля). */
export interface RawZprStatusRow {
    STATUS_ID?: string;
    NAME?: string;
    SORT?: string | number;
    COLOR?: string | null;
    SEMANTICS?: 'S' | 'F' | 'P' | null;
    EXTRA?: { SEMANTICS?: string | null; COLOR?: string | null } | null;
}

const FAILURE_EXTRA_SEMANTICS = new Set(['failure', 'apology']);

/** Стадия-провал (zpr_noresult/zpr_fail): семантика F/failure/apology. */
const isFailureRow = (row: RawZprStatusRow): boolean =>
    row.SEMANTICS === 'F' ||
    FAILURE_EXTRA_SEMANTICS.has(row.EXTRA?.SEMANTICS ?? '');

const normalizeColor = (raw: string | null | undefined): string | undefined => {
    const color = (raw ?? '').trim();
    if (!color) return undefined;
    return color.startsWith('#') ? color : `#${color}`;
};

/**
 * Ответ crm.status.list → словарь ЗПР: полный список в порядке SORT + лестница
 * пути без стадий-провалов (правило buildStageDict сделок: провалы шкалу не
 * удлиняют, успех остаётся финалом).
 */
export const buildZprStageDict = (rows: RawZprStatusRow[]): ZprStageDict => {
    const all = [...rows]
        .sort((a, b) => Number(a.SORT ?? 0) - Number(b.SORT ?? 0))
        .map((row): ZprStageDictItem => {
            const color = normalizeColor(row.COLOR ?? row.EXTRA?.COLOR);
            return {
                statusId: String(row.STATUS_ID ?? ''),
                name: String(row.NAME ?? row.STATUS_ID ?? ''),
                ...(color ? { color } : {}),
                semantics: isFailureRow(row) ? 'F' : (row.SEMANTICS ?? null),
            };
        });
    return { all, ladder: all.filter(item => item.semantics !== 'F') };
};

/** Позиция стадии в лестнице; -1 — вне пути (провал/чужая/нет словаря). */
export const findZprLadderIndex = (
    dict: ZprStageDict | undefined,
    stageId: string,
): number =>
    dict ? dict.ladder.findIndex(item => item.statusId === stageId) : -1;

/** Элемент + словарь → view: имя стадии, семантика, признак «закрыт». */
export const buildZprCallView = (
    call: ZprCall,
    dict: ZprStageDict | undefined,
): ZprCallView => {
    const stage = dict?.all.find(item => item.statusId === call.stageId);
    const semantics = stage?.semantics ?? null;
    return {
        call,
        stageName: stage?.name ?? null,
        semantics,
        isClosed: semantics === 'S' || semantics === 'F',
    };
};

/** Сколько закрытых ЗПР показываем: «последние», а не всю историю. */
export const ZPR_CLOSED_LIMIT = 3;

const timeOf = (value: string | null): number => {
    const time = value ? Date.parse(value) : NaN;
    return Number.isFinite(time) ? time : 0;
};

/**
 * Разрезка ленты: открытые (план раньше — выше, ближайший звонок сверху) +
 * последние закрытые (свежие сверху, не больше лимита). Пока словари стадий
 * едут, элемент считается открытым — устаканится следующим рендером.
 */
export const splitZprCalls = (
    views: ZprCallView[],
    closedLimit: number = ZPR_CLOSED_LIMIT,
): { open: ZprCallView[]; closed: ZprCallView[]; closedTotal: number } => {
    const open = views
        .filter(view => !view.isClosed)
        .sort(
            (a, b) =>
                timeOf(a.call.planDate) - timeOf(b.call.planDate) ||
                a.call.id - b.call.id,
        );
    const closedAll = views
        .filter(view => view.isClosed)
        .sort(
            (a, b) =>
                timeOf(b.call.doneDate) - timeOf(a.call.doneDate) ||
                b.call.id - a.call.id,
        );
    return {
        open,
        closed: closedAll.slice(0, closedLimit),
        closedTotal: closedAll.length,
    };
};
