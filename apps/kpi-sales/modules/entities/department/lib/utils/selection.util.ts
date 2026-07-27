import type {
    ReportFilterSelectionDto,
    SavedReportFilterDto,
} from '@workspace/nest-kpi-report-sales-api';
import type { SalesDepartment } from '../../model';

const groupUserIds = (group: { USERS?: unknown[] | null }): number[] =>
    ((group.USERS ?? []) as { ID: number | string }[]).map(u => Number(u.ID));

/**
 * Текущий плоский выбор → структурный формат v2 для сохранения.
 * Отделы/группы без единого выбранного сотрудника в формат не попадают.
 */
export const buildSelectionV2 = (
    departments: SalesDepartment[],
    selectedIds: Set<number>,
): ReportFilterSelectionDto => ({
    departments: departments
        .map(dep => {
            const groups = dep.groups.map(group => {
                const ids = groupUserIds(group);
                const selected = ids.filter(id => selectedIds.has(id));
                return {
                    id: Number(group.ID),
                    all: ids.length > 0 && selected.length === ids.length,
                    userIds: selected,
                };
            });

            const inGroups = new Set(dep.groups.flatMap(groupUserIds));
            const directSelected = dep.allUsers
                .map(user => Number(user.ID))
                .filter(id => !inGroups.has(id) && selectedIds.has(id));

            const allIds = dep.allUsers.map(user => Number(user.ID));
            const all =
                allIds.length > 0 && allIds.every(id => selectedIds.has(id));

            return {
                id: Number(dep.department.ID),
                all,
                groups: groups.filter(g => g.all || g.userIds.length > 0),
                userIds: directSelected,
            };
        })
        .filter(
            dep => dep.all || dep.userIds.length > 0 || dep.groups.length > 0,
        ),
});

/**
 * Сохранённый фильтр → плоский набор выбранных сотрудников по актуальной
 * структуре. v2 разворачивается структурно (переживает кадровые изменения),
 * legacy-запись (selection=null) — по списку legacyUserIds.
 */
export const resolveSavedSelection = (
    departments: SalesDepartment[],
    saved: SavedReportFilterDto,
): number[] => {
    const selection = saved.selection;
    if (!selection) {
        return (saved.legacyUserIds ?? []).map(Number);
    }

    const ids = new Set<number>();
    for (const savedDep of selection.departments ?? []) {
        const dep = departments.find(
            d => Number(d.department.ID) === Number(savedDep.id),
        );
        if (!dep) continue;

        if (savedDep.all) {
            dep.allUsers.forEach(user => ids.add(Number(user.ID)));
            continue;
        }

        for (const savedGroup of savedDep.groups ?? []) {
            const group = dep.groups.find(
                g => Number(g.ID) === Number(savedGroup.id),
            );
            if (!group) continue;
            if (savedGroup.all) {
                groupUserIds(group).forEach(id => ids.add(id));
            } else {
                (savedGroup.userIds ?? []).forEach(id => ids.add(Number(id)));
            }
        }

        (savedDep.userIds ?? []).forEach(id => ids.add(Number(id)));
    }
    return [...ids];
};
