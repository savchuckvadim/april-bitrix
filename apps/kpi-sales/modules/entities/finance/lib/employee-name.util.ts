import type { BXUser } from '@workspace/bx';

/** Имя сотрудника по assignedId из справочника department.items. */
export const financeEmployeeName = (
    items: BXUser[],
    assignedId: number,
): string => {
    const user = items.find(item => Number(item?.ID) === assignedId);
    if (!user) return `Сотрудник #${assignedId}`;
    return (
        [user.NAME, user.LAST_NAME].filter(Boolean).join(' ') ||
        `Сотрудник #${assignedId}`
    );
};
