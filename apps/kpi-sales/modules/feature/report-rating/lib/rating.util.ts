import type {
    Filter,
    ReportData,
} from '@/modules/entities/report/model/types/report/report-type';
import type { StructureSection } from '@/modules/feature/report-tabs';

export interface RatingAction {
    innerCode: string;
    name: string;
    action: Filter;
}

export interface RatingRow {
    name: string;
    value: number;
}

/**
 * Доступные показатели рейтинга — действия из строк отчёта. В отчёт
 * попадают только действия из фильтра пользователя (сохранённый набор),
 * поэтому рейтинги считаются ровно по ним.
 */
export const getRatingActions = (report: ReportData[]): RatingAction[] => {
    if (!report.length || !report[0]?.kpi) return [];
    return report[0].kpi.map(kpi => ({
        innerCode: kpi.action.innerCode,
        name: kpi.action.name || kpi.action.innerCode,
        action: kpi.action,
    }));
};

const userActionValue = (row: ReportData, actionCode: string): number =>
    row.kpi.find(kpi => kpi.action.innerCode === actionCode)?.count ?? 0;

/**
 * Рейтинг сущностей (отделов или групп) по показателю: сумма значений
 * сотрудников секции, отсортировано по убыванию — победители сверху.
 */
export const buildSectionRating = (
    report: ReportData[],
    sections: StructureSection[],
    actionCode: string,
): RatingRow[] =>
    sections
        .map(section => {
            const ids = new Set(section.userIds);
            const value = report
                .filter(row => ids.has(Number(row.user?.ID ?? row.id)))
                .reduce(
                    (sum, row) => sum + userActionValue(row, actionCode),
                    0,
                );
            return { name: section.name, value };
        })
        .sort((a, b) => b.value - a.value);
