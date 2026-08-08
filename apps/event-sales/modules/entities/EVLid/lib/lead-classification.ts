import type { BXLead } from '@workspace/bx';
import type { Portal, PBXField } from '@workspace/pbx';
import { findPortalField } from '@workspace/pbx';

/**
 * Классификация лида по данным портала: принадлежит ли он ОП и является ли
 * заявкой с сайта. Чистые функции + типизированные сигналы — UI и thunk'и
 * ничего не «угадывают» по магическим строкам.
 *
 * «Точно ОП» — конъюнкция не нужна: любой из sales-сигналов достаточен,
 * потому что каждый из них ставится только нашим install/flow.
 */

/** Сигналы классификации (as const — литеральные типы). */
export const ELeadSignal = {
    /** STATUS_ID лида — одна из наших ОП-стадий (категория группы sales). */
    SALES_STAGE: 'salesStage',
    /** Заполнены наши ОП-поля (op_work_status / manager_op). */
    SALES_FIELDS: 'salesFields',
    /** Ответственный — сотрудник отдела продаж. */
    SALES_RESPONSIBLE: 'salesResponsible',
    /** Наш «Источник список» = «Заявка с сайта» (item op_source_1). */
    SITE_OP_SOURCE: 'siteOpSource',
    /** Стандартный источник Битрикса — веб (SOURCE_ID WEB/WEBFORM). */
    SITE_SOURCE_ID: 'siteSourceId',
    /** Заполнен URL опросника с сайта (UF_CRM_LEAD_QUEST_URL). */
    SITE_QUEST_URL: 'siteQuestUrl',
    /** Заполнен «Код партнёра» (UF_CRM_REG_NUMBER) — сайт-лидоген. */
    SITE_REG_NUMBER: 'siteRegNumber',
} as const;

export type LeadSignal = (typeof ELeadSignal)[keyof typeof ELeadSignal];

/** Стандартные SOURCE_ID Битрикса, означающие «пришёл с сайта». */
export const SITE_SOURCE_IDS = ['WEB', 'WEBFORM'] as const;

/** Код item'а «Заявка с сайта» поля op_source_select (реестр pbx-data). */
export const OP_SOURCE_SITE_ITEM_CODE = 'op_source_1';

/** Коды ОП-полей лида, заполненность которых означает «в работе ОП». */
const SALES_MARKER_FIELD_CODES = ['op_work_status', 'manager_op'] as const;

/**
 * Чужие UF-поля сайт-лидогена (созданы не нами, одинаковы на всех порталах):
 * «Оценка» — URL опросника, «Код партнёра» — по нему распределение между
 * отделами. Заполнены → лид пришёл заявкой с сайта.
 */
const QUEST_URL_FIELD = 'UF_CRM_LEAD_QUEST_URL';
const REG_NUMBER_FIELD = 'UF_CRM_REG_NUMBER';

export interface LeadClassification {
    isSalesLead: boolean;
    isSiteRequest: boolean;
    signals: LeadSignal[];
}

/** Лёгкий вход: то, что есть у related-лидов без полного crm.lead.get. */
export interface LeadClassificationInput {
    statusId?: string | null;
    sourceId?: string | null;
    /** Сырое значение UF-поля op_source_select (bitrixId item'а). */
    opSourceRaw?: string | number | null;
    questUrl?: string | null;
    /** «Код партнёра» (UF_CRM_REG_NUMBER). */
    regNumber?: string | null;
    responsibleId?: number | null;
    /** Значения ОП-маркеров (op_work_status, manager_op) — любое заполнено. */
    salesMarkerValues?: unknown[];
}

const resolveLeadField = (
    portal: Portal | null,
    code: string,
): PBXField | undefined =>
    findPortalField(portal?.lead?.bitrixfields, code) ?? undefined;

/** STATUS_ID ∈ стадии наших sales-категорий лида на этом портале. */
export const isSalesLeadStatus = (
    statusId: string | null | undefined,
    portal: Portal | null,
): boolean => {
    if (!statusId) return false;
    return Boolean(
        portal?.lead?.categories?.some(
            category =>
                category.group === 'sales' &&
                category.stages?.some(
                    stage => String(stage.bitrixId) === String(statusId),
                ),
        ),
    );
};

/** Значение op_source_select → это item «Заявка с сайта»? (по слепку) */
export const isSiteOpSource = (
    raw: string | number | null | undefined,
    portal: Portal | null,
): boolean => {
    if (raw === null || raw === undefined || raw === '') return false;
    const field = resolveLeadField(portal, 'op_source_select');
    const item = field?.items?.find(
        candidate => String(candidate.bitrixId) === String(raw),
    );
    return item?.code === OP_SOURCE_SITE_ITEM_CODE;
};

export const classifyLead = (
    input: LeadClassificationInput,
    portal: Portal | null,
    salesUserIds?: ReadonlySet<number>,
): LeadClassification => {
    const signals: LeadSignal[] = [];

    if (isSalesLeadStatus(input.statusId, portal)) {
        signals.push(ELeadSignal.SALES_STAGE);
    }
    if (
        input.salesMarkerValues?.some(
            value => value !== null && value !== undefined && value !== '',
        )
    ) {
        signals.push(ELeadSignal.SALES_FIELDS);
    }
    if (
        input.responsibleId &&
        salesUserIds?.has(Number(input.responsibleId))
    ) {
        signals.push(ELeadSignal.SALES_RESPONSIBLE);
    }

    if (isSiteOpSource(input.opSourceRaw, portal)) {
        signals.push(ELeadSignal.SITE_OP_SOURCE);
    }
    if (
        input.sourceId &&
        (SITE_SOURCE_IDS as readonly string[]).includes(
            String(input.sourceId).toUpperCase(),
        )
    ) {
        signals.push(ELeadSignal.SITE_SOURCE_ID);
    }
    if (input.questUrl?.trim()) {
        signals.push(ELeadSignal.SITE_QUEST_URL);
    }
    if (input.regNumber?.trim()) {
        signals.push(ELeadSignal.SITE_REG_NUMBER);
    }

    const isSiteRequest = signals.some(
        signal =>
            signal === ELeadSignal.SITE_OP_SOURCE ||
            signal === ELeadSignal.SITE_SOURCE_ID ||
            signal === ELeadSignal.SITE_QUEST_URL ||
            signal === ELeadSignal.SITE_REG_NUMBER,
    );
    const isSalesLead =
        isSiteRequest ||
        signals.some(
            signal =>
                signal === ELeadSignal.SALES_STAGE ||
                signal === ELeadSignal.SALES_FIELDS ||
                signal === ELeadSignal.SALES_RESPONSIBLE,
        );

    return { isSalesLead, isSiteRequest, signals };
};

/** Адаптер полного лида (crm.lead.get): вытаскивает вход из сырых полей. */
export const classifyBxLead = (
    lead: BXLead | null,
    portal: Portal | null,
    salesUserIds?: ReadonlySet<number>,
): LeadClassification => {
    if (!lead) {
        return { isSalesLead: false, isSiteRequest: false, signals: [] };
    }
    const raw = lead as unknown as Record<string, unknown>;
    const ufValue = (code: string): unknown => {
        const field = resolveLeadField(portal, code);
        return field ? raw[`UF_CRM_${field.bitrixId}`] : undefined;
    };

    return classifyLead(
        {
            statusId: raw['STATUS_ID'] ? String(raw['STATUS_ID']) : null,
            sourceId: raw['SOURCE_ID'] ? String(raw['SOURCE_ID']) : null,
            opSourceRaw: ufValue('op_source_select') as
                | string
                | number
                | null,
            questUrl: raw[QUEST_URL_FIELD]
                ? String(raw[QUEST_URL_FIELD])
                : null,
            regNumber: raw[REG_NUMBER_FIELD]
                ? String(raw[REG_NUMBER_FIELD])
                : null,
            responsibleId: raw['ASSIGNED_BY_ID']
                ? Number(raw['ASSIGNED_BY_ID'])
                : null,
            salesMarkerValues: SALES_MARKER_FIELD_CODES.map(code =>
                ufValue(code),
            ),
        },
        portal,
        salesUserIds,
    );
};
