/**
 * Сборка данных планов для Excel (PlansExcelDto бэка): лист «Планы»
 * (план/факт/% + секции отделов/групп) и подстроки «— план» главной
 * таблицы (только kpi-показатели — их колонки есть в главном листе).
 *
 * ЗЕРКАЛО UI: вызывающий код передаёт только видимых пользователей
 * (рядовой — свою строку) и включает mainRows только когда блок планов
 * видим; фича выключена/не настроена — планов в Excel нет вовсе.
 */
import {
    aggregateCells,
    EnabledPlanIndicator,
    PlanAchievementRow,
} from './plan-achievement.util';

/** Форма PlansExcelDto бэка (generated-типы подключаются в download-thunk). */
export interface PlansExcelPayload {
    columns: string[];
    units: string[];
    rows: { userName: string; cells: PlansExcelCellPayload[] }[];
    total: PlansExcelCellPayload[];
    sections?: {
        title: string;
        rows: { userName: string; cells: PlansExcelCellPayload[] }[];
        total: PlansExcelCellPayload[];
    }[];
    mainRows?: { userId: number; cells: { code: string; plan: number }[] }[];
}

export interface PlansExcelCellPayload {
    plan: number | null;
    fact: number;
    percent: number | null;
}

export interface PlansExcelSectionSource {
    title: string;
    userIds: number[];
}

const toCells = (row: PlanAchievementRow): PlansExcelCellPayload[] =>
    row.cells.map(cell => ({
        plan: cell.plan,
        fact: cell.fact,
        percent: cell.percent,
    }));

/** Полный payload листа «Планы» (+ mainRows при видимом блоке). */
export const buildPlansExcelPayload = (
    indicators: EnabledPlanIndicator[],
    rows: PlanAchievementRow[],
    sections: PlansExcelSectionSource[],
    withMainRows: boolean,
): PlansExcelPayload | null => {
    if (!indicators.length || !rows.length) return null;

    const sectionPayloads = sections
        .map(section => {
            const sectionRows = rows.filter(row =>
                section.userIds.includes(row.userId),
            );
            return {
                title: section.title,
                rows: sectionRows.map(row => ({
                    userName: row.userName,
                    cells: toCells(row),
                })),
                total: aggregateCells(indicators, sectionRows).map(cell => ({
                    plan: cell.plan,
                    fact: cell.fact,
                    percent: cell.percent,
                })),
            };
        })
        .filter(section => section.rows.length > 0);

    // Подстроки «— план» главной таблицы: только kpi-показатели (их
    // колонки есть в главном листе), ключ — innerCode.
    const mainRows = withMainRows
        ? rows
              .map(row => ({
                  userId: row.userId,
                  cells: row.cells.flatMap((cell, index) => {
                      const indicator = indicators[index]!;
                      return indicator.factSource === 'kpi' &&
                          cell.plan !== null
                          ? [{ code: indicator.factKey, plan: cell.plan }]
                          : [];
                  }),
              }))
              .filter(row => row.cells.length > 0)
        : undefined;

    return {
        columns: indicators.map(indicator => indicator.displayName),
        units: indicators.map(indicator => indicator.unit),
        rows: rows.map(row => ({
            userName: row.userName,
            cells: toCells(row),
        })),
        total: aggregateCells(indicators, rows).map(cell => ({
            plan: cell.plan,
            fact: cell.fact,
            percent: cell.percent,
        })),
        sections: sectionPayloads.length ? sectionPayloads : undefined,
        mainRows: mainRows?.length ? mainRows : undefined,
    };
};
