'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Settings2 } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Label } from '@workspace/ui/components/label';
import { useDepartmentTree } from '../lib/hooks/use-department-tree';
import { GroupChips } from './components/GroupChips';
import { EmployeeChips } from './components/EmployeeChips';
import { DepartmentFilterDialog } from './DepartmentFilterDialog';

/** Больше сотрудников — чипы по умолчанию свёрнуты. */
const AUTO_COLLAPSE_LIMIT = 24;

/**
 * Компактный фильтр сотрудников (внешне как раньше): чипы отделов/групп,
 * скрываемые чипы сотрудников и «Настроить» — полноэкранная стеклянная
 * модалка со структурным деревом (мультипортал).
 */
export const CompactDepartmentFilter = () => {
    const {
        tree,
        showDepartmentLevel,
        selectedCount,
        totalCount,
        toggleUser,
        toggleGroup,
        toggleDepartment,
        selectAll,
        clearAll,
    } = useDepartmentTree();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [showEmployees, setShowEmployees] = useState(
        totalCount <= AUTO_COLLAPSE_LIMIT,
    );

    if (!tree.length) return null;

    const hasGroups = tree.some(dep => dep.groups.length > 0);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label>
                    Сотрудники
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                        {selectedCount}/{totalCount}
                    </span>
                </Label>
                <div className="flex gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={selectAll}
                    >
                        Все
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearAll}
                    >
                        Никого
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsDialogOpen(true)}
                    >
                        <Settings2 className="mr-1 h-4 w-4" />
                        Настроить
                    </Button>
                </div>
            </div>

            {(hasGroups || showDepartmentLevel) && (
                <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                        {showDepartmentLevel ? 'Отделы и группы' : 'Группы'}
                    </Label>
                    <GroupChips
                        tree={tree}
                        showDepartmentNames={showDepartmentLevel}
                        onToggleGroup={toggleGroup}
                        onToggleDepartment={toggleDepartment}
                    />
                </div>
            )}

            <div>
                <button
                    type="button"
                    className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => setShowEmployees(open => !open)}
                >
                    {showEmployees ? (
                        <ChevronDown className="h-3 w-3" />
                    ) : (
                        <ChevronRight className="h-3 w-3" />
                    )}
                    {showEmployees
                        ? 'Скрыть сотрудников'
                        : `Показать сотрудников (${totalCount})`}
                </button>
                {showEmployees && (
                    <div className="mt-2">
                        <EmployeeChips tree={tree} onToggleUser={toggleUser} />
                    </div>
                )}
            </div>

            <DepartmentFilterDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
            />
        </div>
    );
};
