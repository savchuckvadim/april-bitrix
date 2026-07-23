'use client';

import { Badge } from '@workspace/ui/components/badge';
import type { TreeDepartment } from '../../lib/build-tree.util';

interface GroupChipsProps {
    tree: TreeDepartment[];
    /** true — над чипами групп показываются названия отделов (мульти). */
    showDepartmentNames: boolean;
    onToggleGroup: (groupId: number) => void;
    onToggleDepartment: (departmentId: number) => void;
}

/** Чипы групп (как раньше), в мульти — с чипом «весь отдел». */
export const GroupChips = ({
    tree,
    showDepartmentNames,
    onToggleGroup,
    onToggleDepartment,
}: GroupChipsProps) => (
    <div className="space-y-2">
        {tree.map(department => {
            if (!department.groups.length && !showDepartmentNames) {
                return null;
            }
            return (
                <div key={department.id}>
                    {showDepartmentNames && (
                        <div className="mb-1 flex items-center gap-2">
                            <Badge
                                variant={
                                    department.state === 'all'
                                        ? 'default'
                                        : department.state === 'partial'
                                          ? 'secondary'
                                          : 'outline'
                                }
                                className="cursor-pointer"
                                onClick={() =>
                                    onToggleDepartment(department.id)
                                }
                            >
                                {department.name}
                            </Badge>
                        </div>
                    )}
                    {department.groups.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {department.groups.map(group => (
                                <Badge
                                    key={group.id}
                                    variant={
                                        group.state === 'all'
                                            ? 'default'
                                            : group.state === 'partial'
                                              ? 'secondary'
                                              : 'outline'
                                    }
                                    className="cursor-pointer"
                                    onClick={() => onToggleGroup(group.id)}
                                >
                                    {group.name}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>
            );
        })}
    </div>
);
