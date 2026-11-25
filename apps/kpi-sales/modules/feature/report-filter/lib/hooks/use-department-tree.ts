'use client';

import { useCallback, useContext, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { departmentActions } from '@/modules/entities/department';
import {
    buildDepartmentTree,
    TreeDepartment,
    TreeGroup,
} from '../build-tree.util';
import { DepartmentSelectionContext } from '../department-selection.context';

/**
 * Дерево «отдел → группа → сотрудник» поверх department-слайса.
 * Источник выбора — поставщик DepartmentSelectionProvider (панель фильтров
 * правит черновик); без поставщика — department.current (BXUser[]): тогглы
 * пересобирают его и диспатчат setDepartmentCurrent.
 */
export const useDepartmentTree = () => {
    const dispatch = useAppDispatch();
    const department = useAppSelector(state => state.department);
    const selection = useContext(DepartmentSelectionContext);
    // Отдельной переменной: eslint react-hooks не принимает `.current` в deps.
    const currentUsers = department.current;

    const visibleIds = useMemo(
        () => new Set(department.items.map(u => Number(u.ID))),
        [department.items],
    );
    const selectedIds = useMemo(
        () =>
            selection
                ? new Set(
                      selection.selectedIds.filter(id => visibleIds.has(id)),
                  )
                : new Set(currentUsers.map(u => Number(u.ID))),
        [selection, currentUsers, visibleIds],
    );

    const tree: TreeDepartment[] = useMemo(
        () => buildDepartmentTree(department.departments, visibleIds, selectedIds),
        [department.departments, visibleIds, selectedIds],
    );

    const applySelection = useCallback(
        (ids: Set<number>) => {
            if (selection) {
                selection.onChange([...ids]);
                return;
            }
            const users = department.items.filter(u =>
                ids.has(Number(u.ID)),
            );
            dispatch(departmentActions.setDepartmentCurrent(users));
        },
        [selection, department.items, dispatch],
    );

    const toggleUser = useCallback(
        (userId: number) => {
            const next = new Set(selectedIds);
            if (next.has(userId)) {
                next.delete(userId);
            } else {
                next.add(userId);
            }
            applySelection(next);
        },
        [selectedIds, applySelection],
    );

    /** Группа: partial/none → выбрать всех её сотрудников, all → снять. */
    const toggleGroup = useCallback(
        (groupId: number) => {
            const group = tree
                .flatMap(dep => dep.groups)
                .find(g => g.id === groupId);
            if (!group) return;
            const next = new Set(selectedIds);
            const select = group.state !== 'all';
            group.users.forEach(user =>
                select ? next.add(user.id) : next.delete(user.id),
            );
            applySelection(next);
        },
        [tree, selectedIds, applySelection],
    );

    /** Отдел целиком: partial/none → выбрать, all → снять. */
    const toggleDepartment = useCallback(
        (departmentId: number) => {
            const dep = tree.find(d => d.id === departmentId);
            if (!dep) return;
            const next = new Set(selectedIds);
            const select = dep.state !== 'all';
            const users = [
                ...dep.groups.flatMap((g: TreeGroup) => g.users),
                ...dep.directUsers,
            ];
            users.forEach(user =>
                select ? next.add(user.id) : next.delete(user.id),
            );
            applySelection(next);
        },
        [tree, selectedIds, applySelection],
    );

    const selectAll = useCallback(
        () => applySelection(new Set(visibleIds)),
        [visibleIds, applySelection],
    );
    const clearAll = useCallback(
        () => applySelection(new Set()),
        [applySelection],
    );

    return {
        tree,
        /** Уровень отделов показываем, когда отделов больше одного. */
        showDepartmentLevel: tree.length > 1,
        isHeadManager: department.isHeadManager,
        selectedCount: selectedIds.size,
        totalCount: visibleIds.size,
        /**
         * Выбор правит черновик, и в нём никого нет: при «Применить» это
         * «все видимые» — показываем подсказку рядом со счётчиком.
         */
        showEmptySelectionHint:
            selection !== null && selectedIds.size === 0 && visibleIds.size > 0,
        toggleUser,
        toggleGroup,
        toggleDepartment,
        selectAll,
        clearAll,
    };
};
