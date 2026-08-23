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
    /**
     * Поштучная установка/синхронизация ОДНОЙ стадии из шаблона: заводит её в
     * Bitrix и PortalDB, ничего не удаляя. Нужна, когда в шаблон добавили
     * одну строку — переустанавливать всю воронку ради неё не надо.
     *
     * Опционально: сейчас эндпоинт есть только у сделки; Smart и RPA его не
     * реализуют, и кнопка для них не показывается.
     *
     * @param reorder пересчитать SORT остальных стадий воронки по шаблону.
     * Обязателен, когда стадия встаёт в СЕРЕДИНУ лестницы: иначе у соседей
     * останутся старые SORT и стадия окажется в Bitrix последней.
     */
    syncStage?: (
        domain: string,
        categoryCode: string,
        stageCode: string,
        reorder: boolean,
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
