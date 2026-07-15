import { BXUser } from '@workspace/bx';
import { DepartmentModeStateItem } from '../type/department-type';

const MODE_STORAGE_KEY = 'event-sales:currentDepartmentMode';

/** Режим по должности пользователя: «ТМЦ» в WORK_POSITION → tmc (id=1). */
export const getModeIdByUser = (user: BXUser | null): number => {
    return user?.WORK_POSITION?.includes('ТМЦ') ? 1 : 0;
};

export const saveDepartmentMode = (mode: DepartmentModeStateItem): void => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(MODE_STORAGE_KEY, JSON.stringify(mode));
    } catch {
        // localStorage может быть недоступен в iframe с ограничениями
    }
};

export const getSavedDepartmentMode = (): DepartmentModeStateItem | null => {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(MODE_STORAGE_KEY);
        return raw ? (JSON.parse(raw) as DepartmentModeStateItem) : null;
    } catch {
        return null;
    }
};
