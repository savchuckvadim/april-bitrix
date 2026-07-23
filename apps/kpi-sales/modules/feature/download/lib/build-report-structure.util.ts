import type { SalesDepartment } from '@/modules/entities/department';

export interface IReportStructureGroup {
    id: number;
    name: string;
    userIds: number[];
}

export interface IReportStructureDepartment {
    id: number;
    name: string;
    groups: IReportStructureGroup[];
    userIds: number[];
}

export interface IReportStructure {
    isMultiple: boolean;
    departments: IReportStructureDepartment[];
}

/**
 * Структура отделов/групп для excel-разбивки: только сотрудники,
 * реально попавшие в отчёт (reportUserIds). Пустые группы/отделы опущены.
 */
export const buildReportStructure = (
    departments: SalesDepartment[],
    isMultiple: boolean,
    reportUserIds: Set<number>,
): IReportStructure | undefined => {
    const structureDepartments = departments
        .map(dep => {
            const groups = dep.groups
                .map(group => ({
                    id: Number(group.ID),
                    name: group.NAME,
                    userIds: (group.USERS ?? [])
                        .map(u => Number(u.ID))
                        .filter(id => reportUserIds.has(id)),
                }))
                .filter(group => group.userIds.length > 0);

            const inGroups = new Set(groups.flatMap(g => g.userIds));
            const userIds = dep.allUsers
                .map(u => Number(u.ID))
                .filter(id => reportUserIds.has(id) && !inGroups.has(id));

            return {
                id: Number(dep.department.ID),
                name: dep.department.NAME,
                groups,
                userIds,
            };
        })
        .filter(dep => dep.groups.length > 0 || dep.userIds.length > 0);

    if (!structureDepartments.length) return undefined;

    return { isMultiple, departments: structureDepartments };
};
