import {
    PBX_SMART_TYPE,
    type Portal,
    type PortalParts,
    type PortalPartsQuery,
} from '../model/dto';

/**
 * Части портала, которые читает конструктор: поля и воронки сделки, поля
 * компании, RPA «Поставка» и два своих смарта. Списки, контакт, лид, отделы и
 * остальные смарты (около двух третей полной модели) ему не нужны.
 * Понадобится новая часть (контакт — для отчёта о поставке) — дописать сюда.
 */
export const KONSTRUCTOR_PORTAL_QUERY: PortalPartsQuery = {
    parts: ['bitrixDeal', 'company', 'rpas', 'smarts'],
    // смарты конструктор ищет по типу…
    smartTypes: [PBX_SMART_TYPE.SERVICE_OFFER, PBX_SMART_TYPE.COMPLECT_VARIANT],
    // …и берёт от них только entityTypeId: поля смартов не читает никто
    withoutFields: ['smarts'],
};

/**
 * Портал той же формы, что отдаёт полная ручка, собранный из частей: читатели
 * (`state.portal.current`) не меняются. Незапрошенные части — пустые.
 */
export const portalFromParts = (parts: PortalParts): Portal => ({
    id: parts.id,
    bitrixDeal: parts.bitrixDeal ?? null,
    // в полной модели deals — список, а bitrixDeal — его первый элемент
    deals: parts.bitrixDeal ? [parts.bitrixDeal] : [],
    company: parts.company ?? null,
    rpas: parts.rpas ?? [],
    smarts: parts.smarts ?? [],
    bitrixSmart: null,
    bitrixLists: parts.bitrixLists ?? [],
    bitrixCallingTasksGroup: parts.bitrixCallingTasksGroup ?? null,
    departament: parts.departament ?? null,
    user: parts.user ?? null,
    lead: parts.lead ?? null,
    contact: parts.contact ?? null,
});
