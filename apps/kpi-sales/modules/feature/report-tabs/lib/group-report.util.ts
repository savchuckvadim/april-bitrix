import type { ReportData } from '@/modules/entities/report/model/types/report/report-type';
import type { SalesDepartment } from '@/modules/entities/department';

export interface ReportSection {
    id: string;
    name: string;
    report: ReportData[];
}

const rowUserId = (row: ReportData): number =>
    Number(row.user?.ID ?? row.id);

const rowsForUserIds = (
    report: ReportData[],
    ids: Set<number>,
): ReportData[] => report.filter(row => ids.has(rowUserId(row)));

/** Строки отчёта, разложенные по отделам продаж (пустые отделы опущены). */
export const groupReportByDepartments = (
    report: ReportData[],
    departments: SalesDepartment[],
): ReportSection[] =>
    departments
        .map(dep => ({
            id: `dep-${dep.department.ID}`,
            name: dep.department.NAME,
            report: rowsForUserIds(
                report,
                new Set(dep.allUsers.map(u => Number(u.ID))),
            ),
        }))
        .filter(section => section.report.length > 0);

/**
 * Строки отчёта по группам. В мультирежиме имя секции с префиксом отдела.
 * Сотрудники отдела вне групп попадают в секцию «Без группы».
 */
export const groupReportByGroups = (
    report: ReportData[],
    departments: SalesDepartment[],
    withDepartmentPrefix: boolean,
): ReportSection[] => {
    const sections: ReportSection[] = [];

    for (const dep of departments) {
        const grouped = new Set<number>();

        for (const group of dep.groups) {
            const ids = new Set(
                (group.USERS ?? []).map(u => Number(u.ID)),
            );
            ids.forEach(id => grouped.add(id));
            const rows = rowsForUserIds(report, ids);
            if (rows.length) {
                sections.push({
                    id: `group-${group.ID}`,
                    name: withDepartmentPrefix
                        ? `${dep.department.NAME} — ${group.NAME}`
                        : group.NAME,
                    report: rows,
                });
            }
        }

        if (dep.groups.length > 0) {
            const directIds = new Set(
                dep.allUsers
                    .map(u => Number(u.ID))
                    .filter(id => !grouped.has(id)),
            );
            const rows = rowsForUserIds(report, directIds);
            if (rows.length) {
                sections.push({
                    id: `nogroup-${dep.department.ID}`,
                    name: withDepartmentPrefix
                        ? `${dep.department.NAME} — Без группы`
                        : 'Без группы',
                    report: rows,
                });
            }
        }
    }

    return sections;
};
