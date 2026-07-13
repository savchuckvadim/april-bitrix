import {
    getPbxDealCategoryInstall,
    getPbxDealCategoryInstallMonitoring,
} from '@workspace/nest-pbx-install-api';
import '@/modules/entities/pbx/lib/pbx-install-client';
import type { PbxCategoriesAdapter } from '../../../../categories';
import {
    DEAL_CATEGORY_NAMES,
    PBX_GROUPS,
    type DealCategoryName,
    type PbxCategoriesMonitoringData,
    type PbxGroup,
} from '../../../../lib/model/common';

const install = getPbxDealCategoryInstall();
const monitoring = getPbxDealCategoryInstallMonitoring();

/** `PbxCategoriesAdapter` for the `PBX Deal Category Install` controllers. */
export const dealCategoriesAdapter: PbxCategoriesAdapter = {
    key: 'deal-category',
    label: 'Сделка · воронки и стадии',
    groupOptions: PBX_GROUPS,
    variantOptions: DEAL_CATEGORY_NAMES,
    variantLabel: 'Воронка',
    canDeleteCategories: true,
    create: ({ group, variant }) => ({
        getMonitoringData: (domain) =>
            monitoring.pbxDealCategoryInstallMonitoringGetCategoriesByDomain(
                domain,
            ) as unknown as Promise<PbxCategoriesMonitoringData>,
        getTemplateCategories: async () => {
            const data =
                await monitoring.pbxDealCategoryInstallMonitoringGetCategoriesParseData(
                    variant as DealCategoryName,
                    group as PbxGroup,
                );
            return data.categories;
        },
        searchCategories: (domain, search) =>
            monitoring.pbxDealCategoryInstallMonitoringSearchCategory(
                domain,
                group as PbxGroup,
                search,
            ) as unknown as Promise<PbxCategoriesMonitoringData>,
        installFromTemplate: (domain) =>
            install.pbxDealCategoryInstallInstallDealCategories(
                domain,
                group as PbxGroup,
                variant as DealCategoryName,
            ),
        installCategories: (domain, categories) =>
            install.pbxDealCategoryInstallInstallDealCategoriesByCategoriesData({
                domain,
                categories,
            }),
        deleteCategories: (domain, codes) =>
            install.pbxDealCategoryInstallDeleteDealCategories({ domain, codes }),
        deleteStage: (domain, categoryCode, stageCode) =>
            install.pbxDealCategoryInstallDeleteDealCategoryStage({
                domain,
                categoryCode,
                stageCode,
            }),
        editStage: (domain, categoryCode, stageCode, newValue) =>
            install.pbxDealCategoryInstallEditDealCategoryStage({
                domain,
                categoryCode,
                stageCode,
                newValue,
            }),
    }),
};
