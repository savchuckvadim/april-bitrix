import {
    getPbxRpaFieldInstall,
    getPbxRpaFieldInstallMonitoring,
    getPbxRpaParseTemplate,
} from '@workspace/nest-pbx-install-api';
import '@/modules/entities/pbx/lib/pbx-install-client';
import type { PbxFieldsAdapter } from '../../../../fields';
import {
    RPA_NAMES,
    TYPED_GROUPS,
    type PbxFieldsMonitoringData,
    type RpaName,
    type TypedGroup,
} from '../../../../lib/model/common';
import { extractTemplateFields } from '../../../../lib/extract';

const install = getPbxRpaFieldInstall();
const monitoring = getPbxRpaFieldInstallMonitoring();
const parseTemplate = getPbxRpaParseTemplate();

/** `PbxFieldsAdapter` for the `PBX RPA Field Install` controllers. */
export const rpaFieldsAdapter: PbxFieldsAdapter = {
    key: 'rpa-field',
    label: 'RPA · поля',
    capabilities: {
        monitoring: true,
        template: true,
        items: true,
        installFromConstants: false,
    },
    groupOptions: TYPED_GROUPS,
    variantOptions: RPA_NAMES,
    variantLabel: 'RPA',
    create: ({ group, variant }) => {
        const rpaName = variant as RpaName;
        const rpaGroup = group as TypedGroup;
        return {
            getMonitoringData: (domain) =>
                monitoring.pbxRpaFieldInstallMonitoringGetByDomain(
                    domain,
                    rpaName,
                ) as unknown as Promise<PbxFieldsMonitoringData>,
            getTemplateFields: () =>
                parseTemplate
                    .pbxRpaParseTemplateParse(rpaName, rpaGroup)
                    .then(extractTemplateFields),
            searchFields: (domain, search) =>
                monitoring.pbxRpaFieldInstallMonitoringSearch(
                    domain,
                    rpaName,
                    rpaGroup,
                    search,
                ) as unknown as Promise<PbxFieldsMonitoringData>,
            installFromTemplate: (domain) =>
                install.pbxRpaFieldInstallInstallRpaFields(
                    domain,
                    rpaName,
                    rpaGroup,
                ),
            installFields: (domain, fields) =>
                install.pbxRpaFieldInstallInstallRpaFieldsByFieldsData({
                    domain,
                    fields,
                    rpaName,
                }),
            deleteFields: (domain, codes) =>
                install.pbxRpaFieldInstallDeleteRpaFields({
                    domain,
                    codes,
                    type: rpaName,
                    group: rpaGroup,
                }),
            deleteFieldItem: (domain, fieldCode, itemCode) =>
                install.pbxRpaFieldInstallDeleteRpaFieldItem({
                    domain,
                    fieldCode,
                    itemCode,
                    type: rpaName,
                    group: rpaGroup,
                }),
            editFieldItem: (domain, fieldCode, itemCode, newValue) =>
                install.pbxRpaFieldInstallEditRpaFieldItem({
                    domain,
                    fieldCode,
                    itemCode,
                    newValue,
                    type: rpaName,
                    group: rpaGroup,
                }),
        };
    },
};
