import { createContext } from 'react';

/**
 * Внешний источник выбора сотрудников для дерева отделов: выбранные ID и
 * обработчик их смены. Без поставщика дерево правит действующий фильтр
 * (state.department.current) напрямую.
 */
export interface DepartmentSelection {
    /** ID выбранных сотрудников. */
    selectedIds: readonly number[];
    /** Выбор изменён: новый полный список ID. */
    onChange: (ids: number[]) => void;
}

export const DepartmentSelectionContext =
    createContext<DepartmentSelection | null>(null);
