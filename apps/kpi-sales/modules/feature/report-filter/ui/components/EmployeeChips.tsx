'use client';

import { Badge } from '@workspace/ui/components/badge';
import type { TreeDepartment, TreeUser } from '../../lib/build-tree.util';

interface EmployeeChipsProps {
    tree: TreeDepartment[];
    onToggleUser: (userId: number) => void;
}

const collectUsers = (tree: TreeDepartment[]): TreeUser[] => {
    const byId = new Map<number, TreeUser>();
    for (const dep of tree) {
        for (const user of [
            ...dep.groups.flatMap(group => group.users),
            ...dep.directUsers,
        ]) {
            if (!byId.has(user.id)) byId.set(user.id, user);
        }
    }
    return [...byId.values()];
};

/** Чипы сотрудников (как в старом EmployeesFilter). */
export const EmployeeChips = ({ tree, onToggleUser }: EmployeeChipsProps) => (
    <div className="flex flex-wrap gap-2">
        {collectUsers(tree).map(user => (
            <Badge
                key={user.id}
                variant={user.checked ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => onToggleUser(user.id)}
            >
                {user.name}
            </Badge>
        ))}
    </div>
);
