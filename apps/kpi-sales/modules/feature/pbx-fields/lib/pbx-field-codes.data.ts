/**
 * Семантические коды редактируемых pbx-полей — ЕДИНСТВЕННОЕ место фронта,
 * где они записаны. `satisfies` прижимает каждое значение к generated
 * whitelist бэка (PbxFieldUpdateRequestDtoFieldCode) — опечатка или код
 * вне whitelist не соберётся.
 */
import type { PbxFieldCode } from '../model';

export const PBX_FIELD_CODES = {
    /** Тип договора (deal, enum per-portal, confirm). */
    contractType: 'contract_type',
    /** Действие договора с (deal, date|datetime на портале). */
    contractStart: 'contract_start',
    /** Действие договора до (deal, date|datetime на портале). */
    contractEnd: 'contract_end',
    /** Тип клиента (company, enum: state/commerc/ip/fiz/layer). */
    opClientType: 'op_client_type',
} as const satisfies Record<string, PbxFieldCode>;

export type PbxKnownFieldCode =
    (typeof PBX_FIELD_CODES)[keyof typeof PBX_FIELD_CODES];
