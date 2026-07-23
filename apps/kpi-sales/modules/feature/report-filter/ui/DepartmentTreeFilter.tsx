'use client';

import { useMemo, useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { useDepartmentTree } from '../lib/hooks/use-department-tree';
import { filterTreeBySearch } from '../lib/build-tree.util';
import { DepartmentNode } from './components/DepartmentNode';

interface DepartmentTreeFilterProps {
    /** Ограничение высоты списка (в модалке — выше). */
    listHeightClass?: string;
}

/**
 * Дерево «отдел → группа → сотрудник» с tri-state чекбоксами.
 * Мультипортал — уровень отделов; моно — группы/сотрудники.
 * Используется внутри полноэкранной модалки настройки фильтра.
 */
export const DepartmentTreeFilter = ({
    listHeightClass = 'max-h-80',
}: DepartmentTreeFilterProps) => {
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
    const [search, setSearch] = useState('');

    const visibleTree = useMemo(
        () => filterTreeBySearch(tree, search),
        [tree, search],
    );

    if (!tree.length) return null;

    return (
        <div className="space-y-2">
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
                </div>
            </div>

            <Input
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Поиск сотрудника…"
            />

            <div className={`${listHeightClass} space-y-2 overflow-y-auto pr-1`}>
                {visibleTree.map(department => (
                    <DepartmentNode
                        key={department.id}
                        department={department}
                        showHeader={showDepartmentLevel}
                        onToggleDepartment={toggleDepartment}
                        onToggleGroup={toggleGroup}
                        onToggleUser={toggleUser}
                    />
                ))}
            </div>
        </div>
    );
};
