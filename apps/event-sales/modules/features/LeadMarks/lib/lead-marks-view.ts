import {
    findFieldItemByBitrixId,
    findPortalField,
    ufKey,
    type PBXField,
} from '@workspace/pbx';
import { PBX_SALES_EVENT_FIELD_CODES } from '@workspace/pbx-data/entities/field/type/sales/event/pbx-sales-event-field.type';

/**
 * Пометки лида/заявки: статус заявки, тип «не ЦА», атрибуция продажи.
 *
 * Источник истины по решению владельца (2026-08-08) — `op_lead_site_status`
 * («Статус Заявки»): в нём же живёт «Не ЦА», поэтому «заявка / не заявка»
 * определяется заполненностью этого поля, а не отдельным флагом.
 * Атрибуция продажи — `to_sale_deal` НА ЛИДЕ (ссылка на сделку; бэк дублей
 * фильтрует по голому id, поэтому пишем число).
 */

export const LEAD_SITE_STATUS_CODE =
    PBX_SALES_EVENT_FIELD_CODES.op_lead_site_status;
export const LEAD_NOT_CA_TYPE_CODE =
    PBX_SALES_EVENT_FIELD_CODES.op_lead_not_ca_type;
export const LEAD_SALE_DEAL_CODE = PBX_SALES_EVENT_FIELD_CODES.to_sale_deal;

/** Item «Не ЦА» статуса заявки — от него зависит обязательность типа. */
export const LEAD_NOT_CA_ITEM_CODE = 'op_lead_site_status3';

/** Пометки одного лида в состоянии приложения. */
export interface LeadMark {
    id: number;
    title: string;
    /** STATUS_ID лида — стадия в воронке лидов. */
    statusId: string | null;
    /** Код item'а статуса заявки; null — поле пустое («не заявка»). */
    siteStatusCode: string | null;
    /** Код item'а типа «не ЦА»; осмыслен только при siteStatus = «Не ЦА». */
    notCaTypeCode: string | null;
    /** id сделки, с которой прошла продажа (to_sale_deal). */
    saleDealId: number | null;
}

/** Поля лида, нужные фиче: ключи Bitrix + items для шкал. */
export interface LeadMarkFields {
    siteStatus: PBXField | null;
    notCaType: PBXField | null;
    saleDeal: PBXField | null;
}

export const resolveLeadMarkFields = (
    fields: PBXField[] | undefined,
): LeadMarkFields => ({
    siteStatus: findPortalField(fields, LEAD_SITE_STATUS_CODE),
    notCaType: findPortalField(fields, LEAD_NOT_CA_TYPE_CODE),
    saleDeal: findPortalField(fields, LEAD_SALE_DEAL_CODE),
});

/** select для crm.lead.list: база + проинсталлённые поля пометок. */
export const leadMarkSelect = (fields: LeadMarkFields): string[] => [
    'ID',
    'TITLE',
    'STATUS_ID',
    ...[fields.siteStatus, fields.notCaType, fields.saleDeal]
        .filter((field): field is PBXField => Boolean(field))
        .map(ufKey),
];

const toId = (raw: unknown): number | null => {
    // crm-поле может прийти как 123, '123' или 'D_123' — берём цифры.
    const digits = String(raw ?? '').replace(/\D/g, '');
    const id = Number(digits);
    return Number.isFinite(id) && id > 0 ? id : null;
};

const itemCode = (field: PBXField | null, raw: unknown): string | null => {
    if (!field || raw === null || raw === undefined || raw === '') return null;
    return findFieldItemByBitrixId(field, String(raw))?.code ?? null;
};

/** Сырая строка crm.lead.list → пометки лида. */
export const mapLeadMark = (
    row: Record<string, unknown>,
    fields: LeadMarkFields,
): LeadMark => ({
    id: Number(row.ID),
    title: String(row.TITLE ?? '').trim() || `Лид ${row.ID}`,
    statusId: row.STATUS_ID ? String(row.STATUS_ID) : null,
    siteStatusCode: fields.siteStatus
        ? itemCode(fields.siteStatus, row[ufKey(fields.siteStatus)])
        : null,
    notCaTypeCode: fields.notCaType
        ? itemCode(fields.notCaType, row[ufKey(fields.notCaType)])
        : null,
    saleDealId: fields.saleDeal ? toId(row[ufKey(fields.saleDeal)]) : null,
});

/** Заполнены ли обязательные пометки: статус заявки, а у «не ЦА» — ещё и тип. */
export const isLeadMarkComplete = (mark: LeadMark): boolean => {
    if (!mark.siteStatusCode) return false;
    return mark.siteStatusCode === LEAD_NOT_CA_ITEM_CODE
        ? Boolean(mark.notCaTypeCode)
        : true;
};
