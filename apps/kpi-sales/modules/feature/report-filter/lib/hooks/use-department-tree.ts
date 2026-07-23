'use client';

import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { departmentActions } from '@/modules/entities/department';
import {
    buildDepartmentTree,
    TreeDepartment,
    TreeGroup,
} from '../build-tree.util';

/**
 * Дерево «отдел → группа → сотрудник» поверх department-слайса.
 * Источник истины выбора — department.current (BXUser[]); тогглы
 * пересобирают его и диспатчат setDepartmentCurrent.
 */
export const useDepartmentTree = () => {
    const dispatch = useAppDispatch();
    const department = useAppSelector(state => state.department);

    const selectedIds = useMemo(
        () => new Set(department.current.map(u => Number(u.ID))),
        [department.current],
    );
    const visibleIds = useMemo(
        () => new Set(department.items.map(u => Number(u.ID))),
        [department.items],
    );

    const tree: TreeDepartment[] = useMemo(
        () => buildDepartmentTree(department.departments, visibleIds, selectedIds),
        [department.departments, visibleIds, selectedIds],
    );

    const applySelection = useCallback(
        (ids: Set<number>) => {
            const users = department.items.filter(u =>
                ids.has(Number(u.ID)),
            );
            dispatch(departmentActions.setDepartmentCurrent(users));
        },
        [department.items, dispatch],
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
        toggleUser,
        toggleGroup,
        toggleDepartment,
        selectAll,
        clearAll,
    };
};
