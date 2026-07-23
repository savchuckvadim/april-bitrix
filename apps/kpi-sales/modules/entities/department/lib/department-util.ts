import { BXDepartment, BXUser } from '@workspace/bx';

/** Группа считается «текущей», только если выбраны все её сотрудники. */
export function updateCurrentGroupsByUsers(
    allGroups: BXDepartment[],
    currentUsers: BXUser[],
): BXDepartment[] {
    const currentUserIds = new Set(currentUsers.map(user => Number(user.ID)));

    return allGroups.filter(group => {
        if (!group.USERS || group.USERS.length === 0) {
            return false;
        }

        return group.USERS.every(user => currentUserIds.has(Number(user.ID)));
    });
}
