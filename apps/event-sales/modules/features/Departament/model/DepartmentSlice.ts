import { BXUser } from '@workspace/bx';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import {
    DEPARTAMENT_STATE_PROP,
    DUSER_ROLE,
    DepartmentModeStateItem,
    DepartmentState,
    SetCurrentUserPayload,
    SetFetchedDepartamentPayload,
} from '../type/department-type';

export const DEPARTMENT_MODES: DepartmentModeStateItem[] = [
    { id: 0, code: 'sales', name: 'Менеджер ОП' },
    { id: 1, code: 'tmc', name: 'Менеджер ТМЦ' },
];

const initialState: DepartmentState = {
    [DEPARTAMENT_STATE_PROP.DEPARTAMENT]: {
        [DUSER_ROLE.RESPONSIBLE]: { items: [] },
        [DUSER_ROLE.CREATED_BY]: { items: [] },
    },
    [DEPARTAMENT_STATE_PROP.PLAN]: {
        [DUSER_ROLE.RESPONSIBLE]: { current: null },
        [DUSER_ROLE.CREATED_BY]: { current: null },
    },
    [DEPARTAMENT_STATE_PROP.REPORT]: {
        [DUSER_ROLE.RESPONSIBLE]: { current: null },
        [DUSER_ROLE.CREATED_BY]: { current: null },
    },
    [DEPARTAMENT_STATE_PROP.MODE]: {
        items: DEPARTMENT_MODES,
        current: DEPARTMENT_MODES[0]!,
    },
};

const departmentSlice = createSlice({
    name: 'department',
    initialState,
    reducers: {
        /**
         * Пользователи отдела загружены: списки — в departament,
         * ответственный плана/отчёта — текущий юзер, постановщик — bossId
         * (из domain-config, legacy хардкодил по доменам в слайсе).
         */
        setFetchedDepartament: (
            state: DepartmentState,
            action: PayloadAction<SetFetchedDepartamentPayload>,
        ) => {
            const { department, currentUser, bossId } = action.payload;
            const users = department ?? [];
            const boss = { ID: bossId } as BXUser;

            state[DEPARTAMENT_STATE_PROP.DEPARTAMENT][DUSER_ROLE.RESPONSIBLE].items = users;
            state[DEPARTAMENT_STATE_PROP.DEPARTAMENT][DUSER_ROLE.CREATED_BY].items = users;

            for (const target of [
                DEPARTAMENT_STATE_PROP.PLAN,
                DEPARTAMENT_STATE_PROP.REPORT,
            ] as const) {
                state[target][DUSER_ROLE.RESPONSIBLE].current = currentUser;
                state[target][DUSER_ROLE.CREATED_BY].current = boss;
            }
        },
        setCurrentUser: (
            state: DepartmentState,
            action: PayloadAction<SetCurrentUserPayload>,
        ) => {
            const payload = action.payload;
            state[payload.from][payload.role].current = payload.value;
        },
        setMode: (
            state: DepartmentState,
            action: PayloadAction<{ depModeId: number }>,
        ) => {
            const mode = state[DEPARTAMENT_STATE_PROP.MODE].items.find(
                item => item.id == Number(action.payload.depModeId),
            );
            if (mode) {
                state[DEPARTAMENT_STATE_PROP.MODE].current = mode;
            }
        },
    },
});

export const departmentReducer = departmentSlice.reducer;
export const departmentActions = departmentSlice.actions;
