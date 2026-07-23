import type { SalesDepartment } from '../model';

/** Секция разбивки: набор сотрудников отдела или группы. */
export interface StructureSection {
    id: string;
    name: string;
    userIds: number[];
}

/** Секции по отделам продаж. */
export const buildDepartmentSections = (
    departments: SalesDepartment[],
): StructureSection[] =>
    departments.map(dep => ({
        id: `dep-${dep.department.ID}`,
        name: dep.department.NAME,
        userIds: dep.allUsers.map(u => Number(u.ID)),
    }));

/**
 * Секции по группам (мультирежим — с префиксом отдела).
 * Сотрудники отдела вне групп — секция «Без группы».
 */
export const buildGroupSections = (
    departments: SalesDepartment[],
    withDepartmentPrefix: boolean,
): StructureSection[] => {
    const sections: StructureSection[] = [];

    for (const dep of departments) {
        const grouped = new Set<number>();

        for (const group of dep.groups) {
            const userIds = (group.USERS ?? []).map(u => Number(u.ID));
            userIds.forEach(id => grouped.add(id));
            sections.push({
                id: `group-${group.ID}`,
                name: withDepartmentPrefix
                    ? `${dep.department.NAME} — ${group.NAME}`
                    : group.NAME,
                userIds,
            });
        }

        if (dep.groups.length > 0) {
            const directIds = dep.allUsers
                .map(u => Number(u.ID))
                .filter(id => !grouped.has(id));
            if (directIds.length) {
                sections.push({
                    id: `nogroup-${dep.department.ID}`,
                    name: withDepartmentPrefix
                        ? `${dep.department.NAME} — Без группы`
                        : 'Без группы',
                    userIds: directIds,
                });
            }
        }
    }

    return sections;
};

/** Секции, в которых есть хоть один сотрудник из данных отчёта. */
export const filterSectionsByPresent = (
    sections: StructureSection[],
    presentUserIds: Set<number>,
): StructureSection[] =>
    sections
        .map(section => ({
            ...section,
            userIds: section.userIds.filter(id => presentUserIds.has(id)),
        }))
        .filter(section => section.userIds.length > 0);
