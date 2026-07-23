import type { BXUser } from '@workspace/bx';
import type { SalesDepartment } from '@/modules/entities/department';

export type TreeCheckState = 'all' | 'partial' | 'none';

export interface TreeUser {
    id: number;
    name: string;
    checked: boolean;
}

export interface TreeGroup {
    id: number;
    name: string;
    state: TreeCheckState;
    users: TreeUser[];
}

export interface TreeDepartment {
    id: number;
    name: string;
    state: TreeCheckState;
    groups: TreeGroup[];
    /** Сотрудники отдела вне групп. */
    directUsers: TreeUser[];
}

const userName = (user: BXUser): string =>
    [user.NAME, user.LAST_NAME].filter(Boolean).join(' ');

const toTreeUser = (user: BXUser, selectedIds: Set<number>): TreeUser => ({
    id: Number(user.ID),
    name: userName(user),
    checked: selectedIds.has(Number(user.ID)),
});

const stateOf = (users: TreeUser[]): TreeCheckState => {
    if (!users.length) return 'none';
    const checked = users.filter(u => u.checked).length;
    if (checked === 0) return 'none';
    return checked === users.length ? 'all' : 'partial';
};

/**
 * Структура отделов → дерево фильтра. Показываются только сотрудники из
 * видимого периметра роли (visibleIds); отделы без видимых сотрудников
 * опускаются. Моно-портал — дерево из одного отдела.
 */
export const buildDepartmentTree = (
    departments: SalesDepartment[],
    visibleIds: Set<number>,
    selectedIds: Set<number>,
): TreeDepartment[] =>
    departments
        .map(dep => {
            const groups: TreeGroup[] = dep.groups
                .map(group => {
                    const users = (group.USERS ?? [])
                        .filter(u => visibleIds.has(Number(u.ID)))
                        .map(u => toTreeUser(u, selectedIds));
                    return {
                        id: Number(group.ID),
                        name: group.NAME,
                        state: stateOf(users),
                        users,
                    };
                })
                .filter(group => group.users.length > 0);

            const inGroups = new Set(
                groups.flatMap(group => group.users.map(u => u.id)),
            );
            const directUsers = dep.allUsers
                .filter(
                    u =>
                        visibleIds.has(Number(u.ID)) &&
                        !inGroups.has(Number(u.ID)),
                )
                .map(u => toTreeUser(u, selectedIds));

            const allUsers = [
                ...groups.flatMap(group => group.users),
                ...directUsers,
            ];

            return {
                id: Number(dep.department.ID),
                name: dep.department.NAME,
                state: stateOf(allUsers),
                groups,
                directUsers,
            };
        })
        .filter(dep => dep.groups.length > 0 || dep.directUsers.length > 0);

/** Отображаемая фильтрация по поиску (тогглы работают по полному дереву). */
export const filterTreeBySearch = (
    tree: TreeDepartment[],
    search: string,
): TreeDepartment[] => {
    const term = search.trim().toLowerCase();
    if (!term) return tree;

    const matchUser = (user: TreeUser) =>
        user.name.toLowerCase().includes(term);

    return tree
        .map(dep => {
            const groups = dep.groups
                .map(group => ({
                    ...group,
                    users: group.users.filter(matchUser),
                }))
                .filter(group => group.users.length > 0);
            const directUsers = dep.directUsers.filter(matchUser);
            return { ...dep, groups, directUsers };
        })
        .filter(dep => dep.groups.length > 0 || dep.directUsers.length > 0);
};
