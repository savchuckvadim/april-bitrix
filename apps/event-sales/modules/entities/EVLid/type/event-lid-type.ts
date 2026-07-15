export enum EV_LEAD_WORK_STATUS_CODE {
    chok = 'chok',
    ch_region = 'ch_region',
    ok = 'ok',
    fail = 'fail',
    not_ca = 'not_ca',
    exist_in_job = 'exist_in_job',
    in_job = 'in_job',
}

export enum EV_LEAD_WORK_STATUS_NAME {
    chok = 'Чужой клиент',
    ch_region = 'Чужая территория',
    ok = 'Обслуживаемый клиент',
    fail = 'Отказ',
    not_ca = 'Не целевая аудитория',
    exist_in_job = 'уже был в работе',
    in_job = 'В работе',
}

export type EVLeadWorkStatusItem = {
    id: number;
    code: EV_LEAD_WORK_STATUS_CODE;
    name: EV_LEAD_WORK_STATUS_NAME;
};
