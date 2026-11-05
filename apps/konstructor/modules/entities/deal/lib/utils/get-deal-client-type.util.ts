import { findFieldItemByBitrixId, findPortalField, readFieldValue } from '@workspace/pbx';
import { RQ_TYPE } from '@/modules/entities/bx-rq/model/types';
import type { PBXField } from '@/modules/entities/portal';

/** pbx-код поля «Тип Клиента»: оно есть у лида, компании и сделки. */
export const CLIENT_TYPE_FIELD_CODE = 'op_client_type';

/**
 * Код значения `op_client_type` → тип реквизита. Коды значений стабильны на
 * всех порталах (bitrixId у каждого свой): state=Бюджетники,
 * commerc=Коммерческие, ip=ИП, fiz=Физ лицо, layer=Адвокаты (как физлицо,
 * пока у адвокатов нет своего пресета).
 */
const ITEM_CODE_TO_RQ_TYPE: Record<string, RQ_TYPE> = {
    state: RQ_TYPE.BUDGET,
    commerc: RQ_TYPE.ORGANIZATION,
    ip: RQ_TYPE.IP,
    fiz: RQ_TYPE.FIZ,
    layer: RQ_TYPE.FIZ,
};

type PortalFields = PBXField[] | null | undefined;
/** Сделка или компания Bitrix: интерфейсы без индексной сигнатуры тоже подходят. */
type Entity = object | null | undefined;

/**
 * Тип клиента из enumeration-поля сущности: значение в сущности — bitrixId
 * пункта этого портала, пункт даёт стабильный код.
 */
export const readClientType = (fields: PortalFields, entity: Entity): RQ_TYPE | null => {
    const field = findPortalField(fields, CLIENT_TYPE_FIELD_CODE);
    const selected = readFieldValue(
        fields,
        entity as Record<string, unknown> | null | undefined,
        CLIENT_TYPE_FIELD_CODE,
    );
    if (!field || selected === undefined || selected === null || selected === '') return null;
    const item = findFieldItemByBitrixId(field, String(selected));
    return item ? (ITEM_CODE_TO_RQ_TYPE[item.code] ?? null) : null;
};

/** Тип клиента из сделки (поля сделки портала + сделка Bitrix). */
export const getDealClientType = (
    portalDeal: { bitrixfields?: PBXField[] | null } | undefined,
    deal: Entity,
): RQ_TYPE | null => readClientType(portalDeal?.bitrixfields, deal);

/** Тип клиента из компании (поля компании портала + компания Bitrix). */
export const getCompanyClientType = (
    portalCompany: { bitrixfields?: PBXField[] | null } | undefined,
    company: Entity,
): RQ_TYPE | null => readClientType(portalCompany?.bitrixfields, company);

export type ClientTypeSource = 'company' | 'deal';

export interface ResolvedClientType {
    /** Тип клиента, если задан хоть где-то. */
    type: RQ_TYPE | null;
    source: ClientTypeSource | null;
}

export interface ClientTypeInput {
    portalCompany: { bitrixfields?: PBXField[] | null } | undefined;
    company: Entity;
    portalDeal: { bitrixfields?: PBXField[] | null } | undefined;
    deal: Entity;
}

/**
 * Откуда брать тип клиента: компания (её правит шапка, так делал легаси),
 * затем сделка. Нигде не задан — null, потребители подставляют организацию.
 */
export const resolveClientType = (input: ClientTypeInput): ResolvedClientType => {
    const fromCompany = getCompanyClientType(input.portalCompany, input.company);
    if (fromCompany) return { type: fromCompany, source: 'company' };
    const fromDeal = getDealClientType(input.portalDeal, input.deal);
    if (fromDeal) return { type: fromDeal, source: 'deal' };
    return { type: null, source: null };
};

/** Тип клиента для реквизитов и документов: не задан — организация. */
export const DEFAULT_CLIENT_TYPE = RQ_TYPE.ORGANIZATION;
