import type { RelatedDeal, RelatedStage } from '../model';

/**
 * Маппинг сырой сделки портала (`crm.deal.list`) + словаря стадий воронки
 * (`crm.status.list`) в доменную RelatedDeal — тот же тип, что отдаёт граф
 * связей клиента, поэтому полоски стадий едят оба источника одинаково.
 */

/** Строка ответа crm.deal.list (нужные поля из DEAL_SELECT). */
export interface BoundDealRow {
    ID: string | number;
    TITLE?: string | null;
    STAGE_ID?: string | null;
    CATEGORY_ID?: string | number | null;
    OPPORTUNITY?: string | number | null;
    CLOSED?: 'Y' | 'N';
    DATE_CREATE?: string | null;
}

/** Пункт словаря стадий: STATUS_ID + имя + портальный цвет, в порядке SORT. */
export interface StageDictItem {
    statusId: string;
    name: string;
    /** Цвет стадии из настроек воронки портала (#rrggbb); нет — undefined. */
    color?: string;
}

/** Сырая строка crm.status.list (нужные поля). */
export interface RawStatusRow {
    STATUS_ID?: string;
    NAME?: string;
    SORT?: string | number;
    COLOR?: string | null;
    SEMANTICS?: 'S' | 'F' | 'P' | null;
    EXTRA?: { SEMANTICS?: string | null; COLOR?: string | null } | null;
}

const FAILURE_EXTRA_SEMANTICS = new Set(['failure', 'apology']);

/** Стадия-провал («Отказ», «Не состоялась»): семантика F/failure/apology. */
const isFailureStage = (row: RawStatusRow): boolean =>
    row.SEMANTICS === 'F' ||
    FAILURE_EXTRA_SEMANTICS.has(row.EXTRA?.SEMANTICS ?? '');

/**
 * Словарь стадий воронки из ответа crm.status.list: сортировка по SORT,
 * СТАДИИ-ПРОВАЛЫ ВЫРЕЗАЮТСЯ — у сделки с открытой задачей отказных стадий
 * не бывает (её сперва вытаскивают из отказа), а шкала без них короче и
 * честнее: воронка заканчивается продажей. Успех остаётся финалом шкалы.
 */
export const buildStageDict = (rows: RawStatusRow[]): StageDictItem[] =>
    rows
        .filter(row => !isFailureStage(row))
        .sort((a, b) => Number(a.SORT ?? 0) - Number(b.SORT ?? 0))
        .map(row => {
            const color = (row.COLOR ?? row.EXTRA?.COLOR ?? '').trim();
            return {
                statusId: String(row.STATUS_ID ?? ''),
                name: String(row.NAME ?? row.STATUS_ID ?? ''),
                ...(color
                    ? { color: color.startsWith('#') ? color : `#${color}` }
                    : {}),
            };
        });

/**
 * ENTITY_ID справочника стадий воронки: общая — DEAL_STAGE,
 * остальные — DEAL_STAGE_<categoryId>.
 */
export const dealStageEntityId = (
    categoryId: string | number | null | undefined,
): string => {
    const id = Number(categoryId ?? 0);
    return id > 0 ? `DEAL_STAGE_${id}` : 'DEAL_STAGE';
};

/**
 * ENTITY_ID словаря по самому STAGE_ID: у не-общих воронок стадия несёт
 * префикс категории («C5:PREPARATION» → DEAL_STAGE_5, «NEW» → DEAL_STAGE).
 * Нужен сделкам из графа клиента — категорию отдельным полем они не возят.
 */
export const stageEntityIdFromStageId = (
    stageId: string | null | undefined,
): string => {
    const match = /^C(\d+):/.exec(stageId ?? '');
    return match ? `DEAL_STAGE_${match[1]}` : 'DEAL_STAGE';
};

export const mapBoundDeal = (
    row: BoundDealRow,
    stages: StageDictItem[] | undefined,
): RelatedDeal => {
    const stageId = row.STAGE_ID ?? '';
    const order = stages?.findIndex(stage => stage.statusId === stageId) ?? -1;
    const dictItem = order >= 0 ? stages?.[order] : undefined;
    const opportunity = Number(row.OPPORTUNITY);

    // Нет стадии в словаре — полоска не рисуется (order/total не задаём):
    // показать позицию наугад хуже, чем не показать.
    const stage: RelatedStage = {
        bitrixId: stageId,
        ...(dictItem && stages
            ? {
                  title: dictItem.name,
                  order,
                  total: stages.length,
              }
            : {}),
    } as RelatedStage;

    return {
        id: Number(row.ID),
        title: row.TITLE?.trim() || `Сделка ${row.ID}`,
        stage,
        closed: row.CLOSED === 'Y',
        ...(Number.isFinite(opportunity) && opportunity > 0
            ? { opportunity }
            : {}),
        ...(row.DATE_CREATE ? { dateCreate: row.DATE_CREATE } : {}),
    } as RelatedDeal;
};
