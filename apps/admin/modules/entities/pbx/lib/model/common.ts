import type {
    BtxCategoryResponseDto,
    BtxStageResponseDto,
    CategoryDto,
    InstallEntityFieldDto,
    ListItemDto,
    PbxFieldEntityDto,
    PbxFieldItemEntityDto,
    StageDto,
} from '@workspace/nest-pbx-install-api';

/* ------------------------------------------------------------------ *
 * Path-param unions shared across pbx-install controllers.
 * ------------------------------------------------------------------ */

export type PbxGroup = 'sales' | 'service';
export type PbxAppName = 'event' | 'konstructor' | 'all';
export type DealCategoryName =
    | 'sales_base'
    | 'sales_xo'
    | 'sales_presentation'
    | 'tmc_base'
    | 'service_base'
    | 'all';

/** Sentinel domain that applies a manage-operation to every portal at once. */
export const ALL_DOMAINS = 'all';

export const PBX_GROUPS: { value: PbxGroup; label: string }[] = [
    { value: 'sales', label: 'Sales' },
    { value: 'service', label: 'Service' },
];

export const PBX_APP_NAMES: { value: PbxAppName; label: string }[] = [
    { value: 'all', label: 'Все' },
    { value: 'event', label: 'Event' },
    { value: 'konstructor', label: 'Konstructor' },
];

export const DEAL_CATEGORY_NAMES: { value: DealCategoryName; label: string }[] = [
    { value: 'all', label: 'Все' },
    { value: 'sales_base', label: 'sales_base' },
    { value: 'sales_xo', label: 'sales_xo' },
    { value: 'sales_presentation', label: 'sales_presentation' },
    { value: 'tmc_base', label: 'tmc_base' },
    { value: 'service_base', label: 'service_base' },
];

/* --- Smart processes --- */
export type SmartName =
    | 'service_offer'
    | 'service_order'
    | 'service_call'
    | 'service_call_result'
    | 'service_call_result_result'
    | 'presentation'
    | 'cold';
/** Smart/RPA group axis includes `general` (unlike the base sales/service). */
export type TypedGroup = 'sales' | 'service' | 'general';

export const SMART_NAMES: { value: SmartName; label: string }[] = [
    { value: 'service_offer', label: 'service_offer' },
    { value: 'service_order', label: 'service_order' },
    { value: 'service_call', label: 'service_call' },
    { value: 'service_call_result', label: 'service_call_result' },
    { value: 'service_call_result_result', label: 'service_call_result_result' },
    { value: 'presentation', label: 'presentation' },
    { value: 'cold', label: 'cold' },
];

export const TYPED_GROUPS: { value: TypedGroup; label: string }[] = [
    { value: 'sales', label: 'Sales' },
    { value: 'service', label: 'Service' },
    { value: 'general', label: 'General' },
];

/* --- RPA processes --- */
export type RpaName = 'supply' | 'presentation';

export const RPA_NAMES: { value: RpaName; label: string }[] = [
    { value: 'supply', label: 'supply' },
    { value: 'presentation', label: 'presentation' },
];

/* ------------------------------------------------------------------ *
 * Field domain aliases.
 * ------------------------------------------------------------------ */

/** Field as described in the Excel/constants template (what *should* be). */
export type PbxTemplateField = InstallEntityFieldDto;
/** Value of an enumeration template field. */
export type PbxTemplateListItem = ListItemDto;
/** Field as it exists in Bitrix / PortalDB (what *is* installed). */
export type PbxInstalledField = PbxFieldEntityDto;
/** Enumeration item of an installed field. */
export type PbxFieldItem = PbxFieldItemEntityDto;

/* ------------------------------------------------------------------ *
 * Category / stage domain aliases.
 * ------------------------------------------------------------------ */

export type PbxTemplateCategory = CategoryDto;
export type PbxTemplateStage = StageDto;
export type PbxInstalledCategory = BtxCategoryResponseDto;
export type PbxInstalledStage = BtxStageResponseDto;

/* ------------------------------------------------------------------ *
 * Monitoring responses.
 *
 * The pbx-install backend returns most monitoring endpoints as `void` in its
 * OpenAPI spec, so the generated client is untyped. We model the *expected*
 * envelopes here; the adapters cast and the `toInstalled*` extractors tolerate
 * either an envelope or a bare array. Refine once the backend annotates Swagger.
 * ------------------------------------------------------------------ */

/** Bitrix user-field representation (`bx` side of a merged field). */
export interface PbxBitrixListItem {
    ID: string;
    VALUE: string;
    XML_ID: string;
    SORT?: string;
    DEF?: string;
    [key: string]: unknown;
}

export interface PbxBitrixField {
    ID: string;
    FIELD_NAME: string;
    XML_ID: string;
    ENTITY_ID?: string;
    USER_TYPE_ID?: string;
    MULTIPLE?: string;
    MANDATORY?: string;
    LIST?: PbxBitrixListItem[];
    [key: string]: unknown;
}

/** A single enum value normalised across template / Bitrix / PortalDB. */
export interface PbxNormalizedItem {
    code: string;
    name: string;
    template?: PbxTemplateListItem;
    portal?: PbxFieldItem;
    bitrix?: PbxBitrixListItem;
    inTemplate: boolean;
    inBitrix: boolean;
    inDb: boolean;
}

/** A field normalised across Bitrix + PortalDB, with merged enum items. */
export interface PbxNormalizedField {
    code: string;
    name: string;
    type?: string;
    /** Bitrix UF field name (`UF_RPA_1_SALE_DATE`) — stable fallback match key. */
    bitrixName?: string;
    portal?: PbxInstalledField;
    bitrix?: PbxBitrixField;
    items: PbxNormalizedItem[];
    inBitrix: boolean;
    inDb: boolean;
}

/**
 * Raw monitoring envelope as returned by `*-install-monitoring/domain/:domain`
 * (typed `void` in the spec). `mergedFields` carries both reps; the two
 * `*WithoutMerged` arrays carry single-source fields. Some adapters synthesise a
 * simpler `{ fields }` shape (e.g. User). The normalisers tolerate all of them.
 */
export interface PbxFieldsMonitoringData {
    mergedFields?: {
        name?: string;
        p?: PbxInstalledField | null;
        bx?: PbxBitrixField | null;
    }[];
    portalFieldsWithoutMerged?: PbxInstalledField[];
    bitrixFieldsWithoutMerged?: PbxBitrixField[];
    fields?: PbxInstalledField[];
    [key: string]: unknown;
}

export interface PbxCategoriesMonitoringData {
    categories?: PbxInstalledCategory[];
    [key: string]: unknown;
}

/* ------------------------------------------------------------------ *
 * Three-source comparison rows (template ↔ Bitrix ↔ PortalDB).
 * ------------------------------------------------------------------ */

export interface PbxFieldCompareRow {
    code: string;
    name: string;
    type?: string;
    template?: PbxTemplateField;
    installed?: PbxNormalizedField;
    inTemplate: boolean;
    inBitrix: boolean;
    inDb: boolean;
    /** Merged enum items across template / Bitrix / PortalDB. */
    items: PbxNormalizedItem[];
}

export interface PbxStageCompareRow {
    code: string;
    name: string;
    categoryCode: string;
    template?: PbxTemplateStage;
    installed?: PbxInstalledStage;
    inTemplate: boolean;
    inBitrix: boolean;
    inDb: boolean;
}

export interface PbxCategoryCompareRow {
    code: string;
    name: string;
    template?: PbxTemplateCategory;
    installed?: PbxInstalledCategory;
    inTemplate: boolean;
    inBitrix: boolean;
    inDb: boolean;
    stages: PbxStageCompareRow[];
}
