import {
    getPbxRpaCategoryInstall,
    getPbxRpaCategoryInstallMonitoring,
    getPbxRpaParseTemplate,
    type RpaCategoryDto,
} from '@workspace/nest-pbx-install-api';
import '@/modules/entities/pbx/lib/pbx-install-client';
import type { PbxCategoriesAdapter } from '../../../../categories';
import {
    RPA_NAMES,
    TYPED_GROUPS,
    type PbxCategoriesMonitoringData,
    type RpaName,
    type TypedGroup,
} from '../../../../lib/model/common';
import { extractTemplateCategories } from '../../../../lib/extract';

const install = getPbxRpaCategoryInstall();
const monitoring = getPbxRpaCategoryInstallMonitoring();
const parseTemplate = getPbxRpaParseTemplate();

/**
 * `PbxCategoriesAdapter` for the `PBX RPA Category Install` controllers. RPA has
 * a single funnel per process: only stage-level management (no delete-category).
 */
export const rpaCategoriesAdapter: PbxCategoriesAdapter = {
    key: 'rpa-category',
    label: 'RPA · воронка и стадии',
    groupOptions: TYPED_GROUPS,
    variantOptions: RPA_NAMES,
    variantLabel: 'RPA',
    canDeleteCategories: false,
    create: ({ group, variant }) => {
        const rpaName = variant as RpaName;
        const rpaGroup = group as TypedGroup;
        return {
            getMonitoringData: (domain) =>
                monitoring.pbxRpaCategoryInstallMonitoringGetByDomain(
                    domain,
                    rpaName,
                ) as unknown as Promise<PbxCategoriesMonitoringData>,
            getTemplateCategories: () =>
                parseTemplate
                    .pbxRpaParseTemplateParse(rpaName, rpaGroup)
                    .then(extractTemplateCategories),
            searchCategories: (domain, search) =>
                monitoring.pbxRpaCategoryInstallMonitoringSearch(
                    domain,
                    rpaName,
                    rpaGroup,
                    search,
                ) as unknown as Promise<PbxCategoriesMonitoringData>,
            installFromTemplate: (domain) =>
                install.pbxRpaCategoryInstallInstallRpaCategories(
                    domain,
                    rpaName,
                    rpaGroup,
                ),
            installCategories: (domain, categories) =>
                install.pbxRpaCategoryInstallInstallRpaCategoriesByData({
                    domain,
                    rpaName,
                    categories: categories as unknown as RpaCategoryDto[],
                }),
            deleteStage: (domain, _categoryCode, stageCode) =>
                install.pbxRpaCategoryInstallDeleteRpaCategoryStage({
                    domain,
                    rpaName,
                    stageCode,
                }),
            editStage: (domain, _categoryCode, stageCode, newValue) =>
                install.pbxRpaCategoryInstallEditRpaCategoryStage({
                    domain,
                    rpaName,
                    stageCode,
                    newValue,
                }),
        };
    },
};
