'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { TreeDepartment } from '../../lib/build-tree.util';
import { TriCheckbox } from './TriCheckbox';
import { GroupNode } from './GroupNode';
import { UserRow } from './UserRow';

interface DepartmentNodeProps {
    department: TreeDepartment;
    /** false — моно-режим: содержимое отдела рендерится без своего уровня. */
    showHeader: boolean;
    onToggleDepartment: (departmentId: number) => void;
    onToggleGroup: (groupId: number) => void;
    onToggleUser: (userId: number) => void;
}

export const DepartmentNode = ({
    department,
    showHeader,
    onToggleDepartment,
    onToggleGroup,
    onToggleUser,
}: DepartmentNodeProps) => {
    const [isOpen, setIsOpen] = useState(true);

    const content = (
        <>
            {department.groups.map(group => (
                <GroupNode
                    key={group.id}
                    group={group}
                    onToggleGroup={onToggleGroup}
                    onToggleUser={onToggleUser}
                />
            ))}
            {department.directUsers.length > 0 && (
                <div>
                    {department.groups.length > 0 && (
                        <div className="px-2 py-1 text-xs uppercase text-muted-foreground">
                            Без группы
                        </div>
                    )}
                    {department.directUsers.map(user => (
                        <UserRow
                            key={user.id}
                            user={user}
                            onToggle={onToggleUser}
                        />
                    ))}
                </div>
            )}
        </>
    );

    if (!showHeader) {
        return <div className="space-y-1">{content}</div>;
    }

    return (
        <div className="rounded-lg border border-border p-2">
            <div className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent">
                <TriCheckbox
                    state={department.state}
                    onToggle={() => onToggleDepartment(department.id)}
                    ariaLabel={department.name}
                />
                <button
                    type="button"
                    className="flex flex-1 items-center gap-1 text-left text-sm font-semibold text-foreground"
                    onClick={() => setIsOpen(open => !open)}
                >
                    {isOpen ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="truncate">{department.name}</span>
                </button>
            </div>
            {isOpen && <div className="ml-4 mt-1 space-y-1">{content}</div>}
        </div>
    );
};
