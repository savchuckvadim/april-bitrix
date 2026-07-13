import {
    getPbxSmartCategoryInstall,
    getPbxSmartCategoryInstallMonitoring,
} from '@workspace/nest-pbx-install-api';
import '@/modules/entities/pbx/lib/pbx-install-client';
import type { PbxCategoriesAdapter } from '../../../../categories';
import {
    SMART_NAMES,
    TYPED_GROUPS,
    type PbxCategoriesMonitoringData,
    type SmartName,
    type TypedGroup,
} from '../../../../lib/model/common';
import { extractTemplateCategories } from '../../../../lib/extract';

const install = getPbxSmartCategoryInstall();
const monitoring = getPbxSmartCategoryInstallMonitoring();

/** `PbxCategoriesAdapter` for the `PBX Smart Category Install` controllers. */
export const smartCategoriesAdapter: PbxCategoriesAdapter = {
    key: 'smart-category',
    label: 'Смарт · воронки и стадии',
    groupOptions: TYPED_GROUPS,
    variantOptions: SMART_NAMES,
    variantLabel: 'Смарт',
    canDeleteCategories: true,
    create: ({ group, variant }) => {
        const smartName = variant as SmartName;
        const smartGroup = group as TypedGroup;
        return {
            getMonitoringData: (domain) =>
                monitoring.pbxSmartCategoryInstallMonitoringGetSmartCategoriesByDomain(
                    domain,
                    smartName,
                    smartGroup,
                ) as unknown as Promise<PbxCategoriesMonitoringData>,
            getTemplateCategories: () =>
                monitoring
                    .pbxSmartCategoryInstallMonitoringParseSmartCategories(
                        smartName,
                        smartGroup,
                    )
                    .then(extractTemplateCategories),
            searchCategories: (domain, search) =>
                monitoring.pbxSmartCategoryInstallMonitoringSearchSmartCategory(
                    domain,
                    smartName,
                    smartGroup,
                    search,
                ) as unknown as Promise<PbxCategoriesMonitoringData>,
            installFromTemplate: (domain) =>
                install.pbxSmartCategoryInstallInstallSmartCategories(
                    domain,
                    smartName,
                    smartGroup,
                ),
            installCategories: (domain, categories) =>
                install.pbxSmartCategoryInstallInstallSmartCategoriesByCategoriesData(
                    {
                        domain,
                        categories,
                        smartName,
                        group: smartGroup,
                    },
                ),
            deleteCategories: (domain, codes) =>
                install.pbxSmartCategoryInstallDeleteSmartCategories({
                    domain,
                    codes,
                    smartName,
                    group: smartGroup,
                }),
            deleteStage: (domain, categoryCode, stageCode) =>
                install.pbxSmartCategoryInstallDeleteSmartCategoryStage({
                    domain,
                    categoryCode,
                    stageCode,
                    smartName,
                    group: smartGroup,
                }),
            editStage: (domain, categoryCode, stageCode, newValue) =>
                install.pbxSmartCategoryInstallEditSmartCategoryStage({
                    domain,
                    categoryCode,
                    stageCode,
                    newValue,
                    smartName,
                    group: smartGroup,
                }),
        };
    },
};
