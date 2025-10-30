import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { updateCurrentGroupsByUsers } from '../lib/department-util';
import { IBXDepartment, IBXUser } from '@workspace/bitrix/src/domain/interfaces/bitrix.interface';

export interface DepartmentState {
    items: IBXUser[];
    current: IBXUser[];
    // detalization: BXUser | null;
    groups: {
        items: IBXDepartment[];
        current: IBXDepartment[];
    };
    isHeadManager: boolean;
}

const initialState: DepartmentState = {
    items: [],
    current: [],
    // detalization: null,
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
        setFetchedDepartment: (
            state: DepartmentState,
            action: PayloadAction<{
                departament: IBXUser[];
                currentUsers: IBXUser[];
                groups: IBXDepartment[];
                currentGroups: IBXDepartment[];
                isHeadManager: boolean;
            }>,
        ) => {
            state.items = action.payload.departament;
            state.current = action.payload.currentUsers;
            state.groups.items = action.payload.groups;
            // state.groups.current = action.payload.currentGroups;
            state.groups.current = updateCurrentGroupsByUsers(
                action.payload.groups,
                action.payload.currentUsers,
            );
            // state.detalization = action.payload.departament.length > 0 ? action.payload.departament[0] as BXUser : null;
            state.isHeadManager = action.payload.isHeadManager;
        },
        setDepartmentCurrent: (
            state: DepartmentState,
            action: PayloadAction<IBXUser[]>,
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
                currentUsers: IBXUser[];
                currentGroups: IBXDepartment[];
            }>,
        ) => {
            state.current = action.payload.currentUsers;
            state.groups.current = action.payload.currentGroups;
        },
    },
});

export const departmentActions = departmentSlice.actions;

export default departmentSlice.reducer;
