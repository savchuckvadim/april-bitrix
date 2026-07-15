import { BXUser } from '@workspace/bx';

export interface SetFetchedDepartamentPayload {
    department: Array<BXUser> | null;
    currentUser: BXUser | null;
    /** ID руководителя-постановщика (из domain-config.bossId) */
    bossId: number;
}

export interface SetCurrentUserPayload {
    from: DEPARTAMENT_STATE_PROP.PLAN | DEPARTAMENT_STATE_PROP.REPORT;
    role: DUSER_ROLE;
    value: BXUser;
}

export type DepartmentState = {
    [DEPARTAMENT_STATE_PROP.DEPARTAMENT]: DepartmentStateItem;
    [DEPARTAMENT_STATE_PROP.PLAN]: DUserStateItem;
    [DEPARTAMENT_STATE_PROP.REPORT]: DUserStateItem;
    [DEPARTAMENT_STATE_PROP.MODE]: DepartmentModeState;
};

export type DepartmentStateItem = {
    [DUSER_ROLE.RESPONSIBLE]: DepartmentRoleStateItem;
    [DUSER_ROLE.CREATED_BY]: DepartmentRoleStateItem;
};

export type DUserStateItem = {
    [DUSER_ROLE.RESPONSIBLE]: DUserRoleStateItem;
    [DUSER_ROLE.CREATED_BY]: DUserRoleStateItem;
};

export type DepartmentModeState = {
    items: Array<DepartmentModeStateItem>;
    current: DepartmentModeStateItem | null;
};

export type DepartmentModeStateItem = {
    id: number;
    code: DepartmentModeStateItemCode;
    name: 'Менеджер ОП' | 'Менеджер ТМЦ';
};

export type DepartmentModeStateItemCode = 'sales' | 'tmc';

export type DepartmentRoleStateItem = {
    items: Array<BXUser>;
};

export type DUserRoleStateItem = {
    current: BXUser | null;
};

export enum DEPARTAMENT_STATE_PROP {
    DEPARTAMENT = 'departament',
    REPORT = 'report',
    PLAN = 'plan',
    MODE = 'mode',
}

export enum DUSER_ROLE {
    RESPONSIBLE = 'responsible',
    CREATED_BY = 'createdBy',
}
