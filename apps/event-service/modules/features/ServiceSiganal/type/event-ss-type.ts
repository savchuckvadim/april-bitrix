export interface EV_SS_BXCHECKLIST  {
    ID: number;
    TITLE: string;
    IS_COMPLETE: boolean;
    PARENT_ID: 0;
    TASK_ID: number;

}

export type EV_SS_BXCHECKBOX = {
    ID: number;
    TITLE: string;
    IS_COMPLETE: 'Y' | 'N';
    TASK_ID: number;
    PARENT_ID: number;

}

export interface EV_SS_CheckList extends EV_SS_BXCHECKLIST  {

    checkboxes: EV_SS_BXCHECKBOX[];

}
