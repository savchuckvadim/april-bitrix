import type { ReportCallingData } from '@/modules/entities/calling-statistics';
import type {
    Filter,
    ReportData,
} from '@/modules/entities/report';
import type { StructureSection } from '@/modules/entities/department';
import { getIsFiltredKpiReportForMergedReport } from '@/modules/shared';

export interface RatingAction {
    code: string;
    name: string;
    /** KPI-действие (для цвета графика); у звонковых показателей нет. */
    filterAction?: Filter;
}

export interface RatingDatasetRow {
    userId: number;
    name: string;
    values: Record<string, number>;
}

/**
 * Единый датасет рейтингов: показатели + значения по сотрудникам.
 * Собирается из данных, уже прошедших фильтр пользователя, поэтому
 * в select попадают ровно интересующие его действия.
 */
export interface RatingDataset {
    actions: RatingAction[];
    rows: RatingDatasetRow[];
}

export interface RatingRow {
    name: string;
    value: number;
}

const reportRowUserId = (row: ReportData): number =>
    Number(row.user?.ID ?? row.id);

/** У строк звонков id лежит в user.ID (userId в данных может отсутствовать). */
export const callingRowUserId = (row: ReportCallingData): number =>
    Number(
        (row.user as { ID?: number | string } | undefined)?.ID ?? row.userId,
    );

/** Полное «Имя Фамилия» строки звонков (как в остальных таблицах). */
const callingRowName = (row: ReportCallingData): string =>
    [row.user?.NAME, row.user?.LAST_NAME].filter(Boolean).join(' ') ||
    row.userName ||
    String(callingRowUserId(row));

/** Полное «Имя Фамилия» строки KPI-отчёта (как в остальных таблицах). */
const reportRowName = (row: ReportData): string =>
    [row.user?.NAME, row.user?.LAST_NAME].filter(Boolean).join(' ') ||
    row.userName ||
    String(reportRowUserId(row));

/** События (KPI-отчёт). */
export const buildKpiRatingDataset = (report: ReportData[]): RatingDataset => {
    if (!report.length || !report[0]?.kpi) return { actions: [], rows: [] };
    return {
        actions: report[0].kpi.map(kpi => ({
            code: kpi.action.innerCode,
            name: kpi.action.name || kpi.action.innerCode,
            filterAction: kpi.action,
        })),
        rows: report.map(row => ({
            userId: reportRowUserId(row),
            name: reportRowName(row),
            values: Object.fromEntries(
                row.kpi.map(kpi => [kpi.action.innerCode, kpi.count || 0]),
            ),
        })),
    };
};

/** Фактические звонки (calling statistics). */
export const buildCallingRatingDataset = (
    callings: ReportCallingData[],
): RatingDataset => {
    if (!callings.length) return { actions: [], rows: [] };
    return {
        actions: (callings[0]?.callings ?? []).map(calling => ({
            code: String(calling.id),
            name: String(calling.action),
        })),
        rows: callings.map(row => ({
            userId: callingRowUserId(row),
            name: callingRowName(row),
            values: Object.fromEntries(
                (row.callings ?? []).map(calling => [
                    String(calling.id),
                    calling.count || 0,
                ]),
            ),
        })),
    };
};

/**
 * Объединённый отчёт: фактические звонки + KPI-события без «План»,
 * «Результативные» и звонковых действий (та же компоновка, что в таблице).
 *
 * Состав сотрудников — как в объединённой таблице (merge-core.util): все
 * из обоих источников, сначала в порядке звонков, затем те, кто есть только
 * в событиях. У каждого сотрудника заполнены все показатели: чего у него
 * нет (звонков или событий) — ноль. Показатель события с названием, уже
 * занятым показателем звонков, не дублируется.
 */
export const buildMergedRatingDataset = (
    report: ReportData[],
    callings: ReportCallingData[],
): RatingDataset => {
    const callingDataset = buildCallingRatingDataset(callings);

    const isMergedKpi = (kpi: ReportData['kpi'][number]): boolean =>
        getIsFiltredKpiReportForMergedReport(kpi.action.name || '');
    const callingNames = new Set(
        callingDataset.actions.map(action => action.name),
    );
    const kpiActions = (report[0]?.kpi ?? [])
        .filter(isMergedKpi)
        .map(kpi => ({
            code: kpi.action.innerCode,
            name: kpi.action.name || kpi.action.innerCode,
            filterAction: kpi.action,
        }))
        .filter(action => !callingNames.has(action.name));
    const kpiCodes = new Set(kpiActions.map(action => action.code));

    const kpiRowByUser = new Map<number, RatingDatasetRow>();
    report.forEach(row => {
        const userId = reportRowUserId(row);
        if (kpiRowByUser.has(userId)) return;
        kpiRowByUser.set(userId, {
            userId,
            name: reportRowName(row),
            values: Object.fromEntries(
                row.kpi
                    .filter(kpi => kpiCodes.has(kpi.action.innerCode))
                    .map(kpi => [kpi.action.innerCode, kpi.count || 0]),
            ),
        });
    });

    const actions = [...callingDataset.actions, ...kpiActions];
    /** Значения по всем показателям отчёта: отсутствующее — ноль. */
    const withAllActions = (
        values: Record<string, number>,
    ): Record<string, number> =>
        Object.fromEntries(
            actions.map(action => [action.code, values[action.code] ?? 0]),
        );

    const callingUserIds = new Set(callingDataset.rows.map(row => row.userId));
    return {
        actions,
        rows: [
            ...callingDataset.rows.map(row => ({
                ...row,
                values: withAllActions({
                    ...row.values,
                    ...(kpiRowByUser.get(row.userId)?.values ?? {}),
                }),
            })),
            ...[...kpiRowByUser.values()]
                .filter(row => !callingUserIds.has(row.userId))
                .map(row => ({ ...row, values: withAllActions(row.values) })),
        ],
    };
};

/**
 * Локальный фильтр объединённого отчёта (пользователи/действия из
 * mergedReport-слайса) поверх датасета: пустой выбор = без ограничения.
 */
export const applyMergedSelection = (
    dataset: RatingDataset,
    selection: { selectedUsers: number[]; selectedActions: string[] },
): RatingDataset => ({
    actions: selection.selectedActions.length
        ? dataset.actions.filter(action =>
              selection.selectedActions.includes(action.name),
          )
        : dataset.actions,
    rows: selection.selectedUsers.length
        ? dataset.rows.filter(row =>
              selection.selectedUsers.includes(row.userId),
          )
        : dataset.rows,
});

/** Рейтинг сущностей (отделы/группы): сумма по секции, победители сверху. */
export const buildSectionRating = (
    dataset: RatingDataset,
    sections: StructureSection[],
    actionCode: string,
): RatingRow[] =>
    sections
        .map(section => {
            const ids = new Set(section.userIds);
            const value = dataset.rows
                .filter(row => ids.has(row.userId))
                .reduce((sum, row) => sum + (row.values[actionCode] ?? 0), 0);
            return { name: section.name, value };
        })
        .sort((a, b) => b.value - a.value);

/** Рейтинг сотрудников: значение показателя, победители сверху. */
export const buildUserRating = (
    dataset: RatingDataset,
    actionCode: string,
): RatingRow[] =>
    dataset.rows
        .map(row => ({ name: row.name, value: row.values[actionCode] ?? 0 }))
        .sort((a, b) => b.value - a.value);
