import type { BXDepartment, BXUser } from '@workspace/bx';
import type {
    CurrentUserInfo,
    DepartmentScope,
    SalesDepartment,
} from '../model';

const uniqueUsers = (users: BXUser[]): BXUser[] => {
    const byId = new Map<number, BXUser>();
    for (const user of users) {
        const id = Number(user.ID);
        if (!byId.has(id)) {
            byId.set(id, user);
        }
    }
    return [...byId.values()];
};

const usersOfGroups = (groups: BXDepartment[]): BXUser[] =>
    uniqueUsers(groups.flatMap(group => group.USERS ?? []));

const findSelf = (
    departments: SalesDepartment[],
    userId: number,
    fallback: BXUser | null,
): BXUser[] => {
    const self = departments
        .flatMap(dep => dep.allUsers)
        .find(user => Number(user.ID) === userId);
    if (self) return [self];
    return fallback ? [fallback] : [];
};

/**
 * Видимый периметр по роли (currentUser.headOf из structure-эндпоинта):
 *  cup / суперпользователь — вся структура;
 *  op — свои отделы (headOfDepartmentIds);
 *  group — свои группы;
 *  null (менеджер) — только он сам.
 *
 * defaultSelected — выбор по умолчанию до применения сохранённого фильтра:
 * руководитель со своей группой — своя группа, иначе все видимые.
 */
export const computeDepartmentScope = (
    departments: SalesDepartment[],
    currentUser: CurrentUserInfo,
    superUser: boolean,
    appUser: BXUser | null,
): DepartmentScope => {
    const userId = Number(currentUser.userId);
    const headIds = new Set(
        (currentUser.headOfDepartmentIds ?? []).map(Number),
    );

    if (superUser || currentUser.headOf === 'cup') {
        const groups = departments.flatMap(dep => dep.groups);
        return {
            users: uniqueUsers(departments.flatMap(dep => dep.allUsers)),
            groups,
            isHeadManager: true,
            defaultSelected: groups.length
                ? usersOfGroups(groups)
                : uniqueUsers(departments.flatMap(dep => dep.allUsers)),
        };
    }

    if (currentUser.headOf === 'op') {
        const own = departments.filter(dep =>
            headIds.has(Number(dep.department.ID)),
        );
        const groups = own.flatMap(dep => dep.groups);
        const users = uniqueUsers(own.flatMap(dep => dep.allUsers));
        return {
            users,
            groups,
            isHeadManager: true,
            defaultSelected: groups.length ? usersOfGroups(groups) : users,
        };
    }

    if (currentUser.headOf === 'group') {
        const ownGroups = departments
            .flatMap(dep => dep.groups)
            .filter(group => headIds.has(Number(group.ID)));
        const users = usersOfGroups(ownGroups);
        return {
            users,
            groups: ownGroups,
            isHeadManager: true,
            defaultSelected: users,
        };
    }

    const self = findSelf(departments, userId, appUser);
    return {
        users: self,
        groups: [],
        isHeadManager: false,
        defaultSelected: self,
    };
};
