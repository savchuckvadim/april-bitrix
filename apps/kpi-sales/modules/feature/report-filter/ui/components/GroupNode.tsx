'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { TreeGroup } from '../../lib/build-tree.util';
import { TriCheckbox } from './TriCheckbox';
import { UserRow } from './UserRow';

interface GroupNodeProps {
    group: TreeGroup;
    onToggleGroup: (groupId: number) => void;
    onToggleUser: (userId: number) => void;
}

export const GroupNode = ({
    group,
    onToggleGroup,
    onToggleUser,
}: GroupNodeProps) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div>
            <div className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent">
                <TriCheckbox
                    state={group.state}
                    onToggle={() => onToggleGroup(group.id)}
                    ariaLabel={group.name}
                />
                <button
                    type="button"
                    className="flex flex-1 items-center gap-1 text-left text-sm font-medium text-foreground"
                    onClick={() => setIsOpen(open => !open)}
                >
                    {isOpen ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="truncate">{group.name}</span>
                    <span className="ml-1 text-xs text-muted-foreground">
                        {group.users.filter(u => u.checked).length}/
                        {group.users.length}
                    </span>
                </button>
            </div>
            {isOpen && (
                <div className="ml-6 border-l border-border pl-2">
                    {group.users.map(user => (
                        <UserRow
                            key={user.id}
                            user={user}
                            onToggle={onToggleUser}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
