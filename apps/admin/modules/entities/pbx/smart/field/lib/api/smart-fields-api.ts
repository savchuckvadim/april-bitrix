import {
    getPbxSmartFieldInstall,
    getPbxSmartFieldInstallMonitoring,
} from '@workspace/nest-pbx-install-api';
import '@/modules/entities/pbx/lib/pbx-install-client';
import type { PbxFieldsAdapter } from '../../../../fields';
import {
    SMART_NAMES,
    TYPED_GROUPS,
    type PbxFieldsMonitoringData,
    type SmartName,
    type TypedGroup,
} from '../../../../lib/model/common';
import { extractTemplateFields } from '../../../../lib/extract';

const install = getPbxSmartFieldInstall();
const monitoring = getPbxSmartFieldInstallMonitoring();

/** `PbxFieldsAdapter` for the `PBX Smart Field Install` controllers. */
export const smartFieldsAdapter: PbxFieldsAdapter = {
    key: 'smart-field',
    label: 'Смарт · поля',
    capabilities: {
        monitoring: true,
        template: true,
        items: true,
        installFromConstants: false,
    },
    groupOptions: TYPED_GROUPS,
    variantOptions: SMART_NAMES,
    variantLabel: 'Смарт',
    create: ({ group, variant }) => {
        const smartName = variant as SmartName;
        const smartGroup = group as TypedGroup;
        return {
            getMonitoringData: (domain) =>
                monitoring.pbxSmartFieldInstallMonitoringGetSmartFieldsByDomain(
                    domain,
                    smartName,
                    smartGroup,
                ) as unknown as Promise<PbxFieldsMonitoringData>,
            getTemplateFields: () =>
                monitoring
                    .pbxSmartFieldInstallMonitoringParseSmartFields(
                        smartName,
                        smartGroup,
                    )
                    .then(extractTemplateFields),
            searchFields: (domain, search) =>
                monitoring.pbxSmartFieldInstallMonitoringSearchSmartField(
                    domain,
                    smartName,
                    smartGroup,
                    search,
                ) as unknown as Promise<PbxFieldsMonitoringData>,
            installFromTemplate: (domain) =>
                install.pbxSmartFieldInstallInstallSmartFields(
                    domain,
                    smartName,
                    smartGroup,
                ),
            installFields: (domain, fields) =>
                install.pbxSmartFieldInstallInstallSmartFieldsByFieldsData({
                    domain,
                    fields,
                    smartName,
                    group: smartGroup,
                }),
            deleteFields: (domain, codes) =>
                install.pbxSmartFieldInstallDeleteSmartFields({
                    domain,
                    codes,
                    type: smartName,
                    group: smartGroup,
                }),
            deleteFieldItem: (domain, fieldCode, itemCode) =>
                install.pbxSmartFieldInstallDeleteSmartFieldItem({
                    domain,
                    fieldCode,
                    itemCode,
                    type: smartName,
                    group: smartGroup,
                }),
            editFieldItem: (domain, fieldCode, itemCode, newValue) =>
                install.pbxSmartFieldInstallEditSmartFieldItem({
                    domain,
                    fieldCode,
                    itemCode,
                    newValue,
                    type: smartName,
                    group: smartGroup,
                }),
        };
    },
};
