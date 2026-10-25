/** Стадия RPA-процесса (rpa.stage.listForType). */
export interface IBxRpaStage {
    id: number;
    typeId: number;
    name: string;
    code: string;
    color: string;
    sort: number;
    semantic?: string;
    isFirst?: boolean;
    /** Финальные стадии: по ним отфильтровываются закрытые заявки */
    isSuccess?: boolean;
    isFail?: boolean;
}

export interface IBxRpaStageListResponse {
    stages: IBxRpaStage[];
}
