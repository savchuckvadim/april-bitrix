import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit';
import { BXDepartment, BXUser } from "@workspace/bx";
import { updateCurrentGroupsByUsers } from '../lib/department-util';

export interface DepartmentState {
    items: BXUser[];
    current: BXUser[];
    // detalization: BXUser | null;
    groups: {
        items: BXDepartment[];
        current: BXDepartment[];
    };
    isHeadManager: boolean;
}

const initialState: DepartmentState = {
    items: [],
    current: [],
    // detalization: null,
    groups: {
        items: [],
        current: []
    },
    isHeadManager: false
};

const departmentSlice = createSlice({
    name: 'department',
    initialState,
    reducers: {
        setFetchedDepartment: (state: DepartmentState, action: PayloadAction<{
            departament: BXUser[];
            currentUsers: BXUser[];
            groups: BXDepartment[];
            currentGroups: BXDepartment[];
            isHeadManager: boolean;
        }>) => {
            state.items = action.payload.departament;
            state.current = action.payload.currentUsers;
            state.groups.items = action.payload.groups;
            // state.groups.current = action.payload.currentGroups;
            state.groups.current = updateCurrentGroupsByUsers(
                action.payload.groups,
                action.payload.currentUsers
            )
            // state.detalization = action.payload.departament.length > 0 ? action.payload.departament[0] as BXUser : null;
            state.isHeadManager = action.payload.isHeadManager;
        },
        setDepartmentCurrent: (state: DepartmentState, action: PayloadAction<BXUser[]>) => {
            state.current = action.payload;
            state.groups.current = updateCurrentGroupsByUsers(
                state.groups.items,
                action.payload
            )
        },

        setGroup: (state: DepartmentState, action: PayloadAction<{
            currentUsers: BXUser[];
            currentGroups: BXDepartment[];
        }>) => {

            state.current = action.payload.currentUsers;
            state.groups.current = action.payload.currentGroups;
        }
    }
});

export const departmentActions = departmentSlice.actions;


export default departmentSlice.reducer; 