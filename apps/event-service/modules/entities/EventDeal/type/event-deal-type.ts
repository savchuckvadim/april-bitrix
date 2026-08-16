/**
 * Поля договора текущей сделки (pbx-поля contract_start/contract_end).
 * Значения enum'а используются и как ключи ошибок валидации в EventSlice.
 */
export enum EV_DEAL_PROP {
    CONTRACT_START = 'contractStart',
    CONTRACT_END = 'contractEnd',
}

/** Коды pbx-полей сделки для EV_DEAL_PROP. */
export const EV_DEAL_FIELD_CODES: Record<EV_DEAL_PROP, string> = {
    [EV_DEAL_PROP.CONTRACT_START]: 'contract_start',
    [EV_DEAL_PROP.CONTRACT_END]: 'contract_end',
};
