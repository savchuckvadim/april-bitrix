'use client';

import { Checkbox } from '@workspace/ui/components/checkbox';
import type { TreeUser } from '../../lib/build-tree.util';

interface UserRowProps {
    user: TreeUser;
    onToggle: (userId: number) => void;
}

export const UserRow = ({ user, onToggle }: UserRowProps) => (
    <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm text-foreground hover:bg-accent">
        <Checkbox
            checked={user.checked}
            onCheckedChange={() => onToggle(user.id)}
            aria-label={user.name}
        />
        <span className="truncate">{user.name}</span>
    </label>
);
