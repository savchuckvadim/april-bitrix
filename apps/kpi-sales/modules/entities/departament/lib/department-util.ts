import { BXDepartment, BXUser } from "@workspace/bx";

export function updateCurrentGroupsByUsers(
  allGroups: BXDepartment[],
  currentUsers: BXUser[],
): BXDepartment[] {
  const currentUserIds = new Set(currentUsers.map((user) => user.ID));

  return allGroups.filter((group) => {
    if (!group.USERS || group.USERS.length === 0) {
      return false; // если в группе нет пользователей — не добавляем
    }

    return group.USERS.every((user) => currentUserIds.has(user.ID));
  });
}
