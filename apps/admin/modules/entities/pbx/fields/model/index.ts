import type {
    PbxFieldsMonitoringData,
    PbxTemplateField,
} from '../../lib/model/common';

export interface PbxFieldsCapabilities {
    /** Has a list source (monitoring) → render the compare table. */
    monitoring: boolean;
    /** Has a template axis (parse / search / install-by-group). */
    template: boolean;
    /** Supports enumeration item edit/delete. */
    items: boolean;
    /** Supports install-from-constants by domain. */
    installFromConstants: boolean;
}

export interface PbxAxisOption {
    value: string;
    label: string;
}

/** Current selection that scopes every operation (group + variant axis). */
export interface PbxFieldsScope {
    group: string;
    /** appName (Company/Deal) | smartName | rpaName. */
    variant: string;
}

/**
 * Scope-bound field operations. Produced by `PbxFieldsAdapter.create(scope)` so
 * smart/rpa (which thread `smartName`/`rpaName` + group through *every* call) and
 * company/deal (which don't) share one manager. Optional members must exist when
 * the matching capability flag is set.
 */
export interface PbxFieldsApi {
    getMonitoringData?: (domain: string) => Promise<PbxFieldsMonitoringData>;
    /**
     * Template (constants/parse) fields. `domain` is optional and ignored by most
     * adapters (group/variant captured in the closure); User needs it because its
     * only constants source is the per-domain monitoring endpoint.
     */
    getTemplateFields?: (domain?: string) => Promise<PbxTemplateField[]>;
    searchFields?: (
        domain: string,
        search: string,
    ) => Promise<PbxFieldsMonitoringData>;
    installFromTemplate?: (domain: string) => Promise<void>;
    installFromConstants?: (domain: string) => Promise<void>;
    installFields: (domain: string, fields: PbxTemplateField[]) => Promise<void>;
    deleteFields: (domain: string, codes: string[]) => Promise<void>;
    deleteFieldItem?: (
        domain: string,
        fieldCode: string,
        itemCode: string,
    ) => Promise<void>;
    editFieldItem?: (
        domain: string,
        fieldCode: string,
        itemCode: string,
        newValue: string,
    ) => Promise<void>;
}

/** Static metadata + scope-bound api factory for one field-owning entity. */
export interface PbxFieldsAdapter {
    readonly key: string;
    readonly label: string;
    readonly capabilities: PbxFieldsCapabilities;
    /** Group select options (rendered when `capabilities.template`). */
    readonly groupOptions: PbxAxisOption[];
    /** Variant select options — appName / smartName / rpaName. */
    readonly variantOptions: PbxAxisOption[];
    /** Variant select label, e.g. "Приложение" / "Смарт" / "RPA". */
    readonly variantLabel: string;
    create: (scope: PbxFieldsScope) => PbxFieldsApi;
}
