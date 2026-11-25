'use client';

import { useMemo, type ReactNode } from 'react';
import {
    DepartmentSelectionContext,
    type DepartmentSelection,
} from '../lib/department-selection.context';

interface DepartmentSelectionProviderProps extends DepartmentSelection {
    children: ReactNode;
}

/**
 * Поставщик выбора сотрудников: всё дерево под ним (компактный фильтр и
 * диалог настройки — портал остаётся в дереве React, контекст до него
 * доходит) читает и пишет выбор через него, а не через state.department.current.
 */
export const DepartmentSelectionProvider = ({
    selectedIds,
    onChange,
    children,
}: DepartmentSelectionProviderProps) => {
    const value = useMemo(
        () => ({ selectedIds, onChange }),
        [selectedIds, onChange],
    );

    return (
        <DepartmentSelectionContext.Provider value={value}>
            {children}
        </DepartmentSelectionContext.Provider>
    );
};
