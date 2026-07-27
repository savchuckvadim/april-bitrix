import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BXDepartment, BXUser } from '@workspace/bx';
import { updateCurrentGroupsByUsers } from '../lib/utils/department-util';
import type { CurrentUserInfo, SalesDepartment } from './index';

export type DepartmentStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface DepartmentState {
    status: DepartmentStatus;
    /** Мультипортал: несколько ОП, найденных бэком по тэгу. */
    isMulti: boolean;
    multipleTag: string | null;
    /** Полная структура (нормализованная): всегда массив отделов продаж. */
    departments: SalesDepartment[];
    /** Роль и коллеги текущего пользователя (с бэка). */
    currentUser: CurrentUserInfo | null;

    // Видимый периметр и выбор (форма совместима со старым UI фильтров).
    items: BXUser[];
    current: BXUser[];
    groups: {
        items: BXDepartment[];
        current: BXDepartment[];
    };
    isHeadManager: boolean;
}

const initialState: DepartmentState = {
    status: 'idle',
    isMulti: false,
    multipleTag: null,
    departments: [],
    currentUser: null,
    items: [],
    current: [],
    groups: {
        items: [],
        current: [],
    },
    isHeadManager: false,
};

const departmentSlice = createSlice({
    name: 'department',
    initialState,
    reducers: {
        setLoading: (state: DepartmentState) => {
            state.status = 'loading';
        },
        setError: (state: DepartmentState) => {
            state.status = 'error';
        },
        /** Структура загружена: периметр и дефолтный выбор по роли. */
        setStructure: (
            state: DepartmentState,
            action: PayloadAction<{
                isMulti: boolean;
                multipleTag: string | null;
                departments: SalesDepartment[];
                currentUser: CurrentUserInfo;
                visibleUsers: BXUser[];
                visibleGroups: BXDepartment[];
                isHeadManager: boolean;
                defaultSelected: BXUser[];
            }>,
        ) => {
            const payload = action.payload;
            state.status = 'ready';
            state.isMulti = payload.isMulti;
            state.multipleTag = payload.multipleTag;
            state.departments = payload.departments;
            state.currentUser = payload.currentUser;
            state.items = payload.visibleUsers;
            state.groups.items = payload.visibleGroups;
            state.isHeadManager = payload.isHeadManager;
            state.current = payload.defaultSelected;
            state.groups.current = updateCurrentGroupsByUsers(
                payload.visibleGroups,
                payload.defaultSelected,
            );
        },
        setDepartmentCurrent: (
            state: DepartmentState,
            action: PayloadAction<BXUser[]>,
        ) => {
            state.current = action.payload;
            state.groups.current = updateCurrentGroupsByUsers(
                state.groups.items,
                action.payload,
            );
        },
        setGroup: (
            state: DepartmentState,
            action: PayloadAction<{
                currentUsers: BXUser[];
                currentGroups: BXDepartment[];
            }>,
        ) => {
            state.current = action.payload.currentUsers;
            state.groups.current = action.payload.currentGroups;
        },
    },
});

export const departmentActions = departmentSlice.actions;

export default departmentSlice.reducer;
