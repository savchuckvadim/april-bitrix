import {
    getPbxLeadFieldInstall,
    getPbxLeadFieldInstallMonitoring,
} from '@workspace/nest-pbx-install-api';
import '@/modules/entities/pbx/lib/pbx-install-client';
import type { PbxFieldsAdapter } from '../../../../fields';
import {
    PBX_APP_NAMES,
    PBX_GROUPS,
    type PbxAppName,
    type PbxFieldsMonitoringData,
    type PbxGroup,
    type PbxTemplateField,
} from '../../../../lib/model/common';

const install = getPbxLeadFieldInstall();
const monitoring = getPbxLeadFieldInstallMonitoring();

/** `PbxFieldsAdapter` for the `PBX Lead Field Install` controllers. */
export const leadFieldsAdapter: PbxFieldsAdapter = {
    key: 'lead',
    label: 'Лид · поля',
    capabilities: {
        monitoring: true,
        template: true,
        items: true,
        installFromConstants: false,
    },
    groupOptions: PBX_GROUPS,
    variantOptions: PBX_APP_NAMES,
    variantLabel: 'Приложение',
    create: ({ group, variant }) => ({
        getMonitoringData: (domain) =>
            monitoring.pbxLeadFieldInstallMonitoringGetLeadByDomain(
                domain,
            ) as unknown as Promise<PbxFieldsMonitoringData>,
        getTemplateFields: () =>
            monitoring.pbxLeadFieldInstallMonitoringGetLeadFieldsParseData(
                variant as PbxAppName,
                group as PbxGroup,
            ) as unknown as Promise<PbxTemplateField[]>,
        searchFields: (domain, search) =>
            monitoring.pbxLeadFieldInstallMonitoringGetPbxLeadField(
                domain,
                group as PbxGroup,
                search,
            ) as unknown as Promise<PbxFieldsMonitoringData>,
        installFromTemplate: (domain) =>
            install.pbxLeadFieldInstallInstallLeadFields(
                domain,
                group as PbxGroup,
                variant as PbxAppName,
            ),
        installFields: (domain, fields) =>
            install.pbxLeadFieldInstallInstallLeadFieldsByFieldsData({
                domain,
                fields,
            }),
        deleteFields: (domain, codes) =>
            install.pbxLeadFieldInstallDeleteLeadFields({ domain, codes }),
        deleteFieldItem: (domain, fieldCode, itemCode) =>
            install.pbxLeadFieldInstallDeleteLeadFieldItem({
                domain,
                fieldCode,
                itemCode,
            }),
        editFieldItem: (domain, fieldCode, itemCode, newValue) =>
            install.pbxLeadFieldInstallEditLeadFieldItem({
                domain,
                fieldCode,
                itemCode,
                newValue,
            }),
    }),
};
