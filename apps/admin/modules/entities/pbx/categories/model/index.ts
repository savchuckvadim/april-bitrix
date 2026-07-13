import type {
    PbxCategoriesMonitoringData,
    PbxTemplateCategory,
} from '../../lib/model/common';
import type { PbxAxisOption } from '../../fields';

/** Current selection that scopes every category operation. */
export interface PbxCategoriesScope {
    group: string;
    /** categoryName (Deal) | smartName | rpaName. */
    variant: string;
}

/**
 * Scope-bound funnel (category) + nested stage operations. Produced by
 * `PbxCategoriesAdapter.create(scope)` so Deal / Smart / RPA share one manager.
 * `deleteCategories` is optional (RPA has stage-only management).
 */
export interface PbxCategoriesApi {
    getMonitoringData: (domain: string) => Promise<PbxCategoriesMonitoringData>;
    getTemplateCategories: () => Promise<PbxTemplateCategory[]>;
    searchCategories?: (
        domain: string,
        search: string,
    ) => Promise<PbxCategoriesMonitoringData>;
    installFromTemplate: (domain: string) => Promise<void>;
    installCategories: (
        domain: string,
        categories: PbxTemplateCategory[],
    ) => Promise<void>;
    deleteCategories?: (domain: string, codes: string[]) => Promise<void>;
    deleteStage: (
        domain: string,
        categoryCode: string,
        stageCode: string,
    ) => Promise<void>;
    editStage: (
        domain: string,
        categoryCode: string,
        stageCode: string,
        newValue: string,
    ) => Promise<void>;
}

/** Static metadata + scope-bound api factory for one funnel-owning entity. */
export interface PbxCategoriesAdapter {
    readonly key: string;
    readonly label: string;
    readonly groupOptions: PbxAxisOption[];
    readonly variantOptions: PbxAxisOption[];
    readonly variantLabel: string;
    /** Whether categories (not just stages) can be deleted. */
    readonly canDeleteCategories: boolean;
    create: (scope: PbxCategoriesScope) => PbxCategoriesApi;
}
