import { RQ_TYPE, type RqRecord } from '../../bx-rq/model/types';
import { validatePushRq } from '../../bx-rq/lib/field-items-util';
import { CONTRACT_DEAL_FIELDS, type ContractDealField, type ContractDealFieldValues } from '../model/types';

/** Подписи обязательных полей сделки, которые не заполнены (легаси pushRequired). */
export const missingDealFields = (
    values: ContractDealFieldValues,
    fields: ContractDealField[] = CONTRACT_DEAL_FIELDS,
): string[] => fields.filter(field => field.required && !values[field.code]?.trim()).map(field => field.label);

/**
 * Реквизиты клиента, без которых договор не собрать (легаси validatePushRq):
 * нет текущего реквизита — одна общая строка, иначе названия пустых полей.
 */
export const missingRequisites = (clientType: RQ_TYPE | null, rq: RqRecord | null): string[] =>
    rq ? validatePushRq(clientType ?? RQ_TYPE.ORGANIZATION, rq) : ['Реквизиты клиента не выбраны'];

/** Значение input[type=date] (YYYY-MM-DD) → значение поля сделки Bitrix; пусто — ''. */
export const toBitrixDate = (value: string): string => (value.trim() ? value.trim() : '');
