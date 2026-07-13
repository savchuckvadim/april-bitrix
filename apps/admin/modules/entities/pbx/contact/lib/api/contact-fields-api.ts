import {
    getPbxContactInstall,
    getPbxContactInstallMonitoring,
} from '@workspace/nest-pbx-install-api';
import '@/modules/entities/pbx/lib/pbx-install-client';
import type { PbxFieldsAdapter } from '../../../fields';
import {
    PBX_APP_NAMES,
    PBX_GROUPS,
    type PbxAppName,
    type PbxFieldsMonitoringData,
    type PbxGroup,
    type PbxTemplateField,
} from '../../../lib/model/common';

const install = getPbxContactInstall();
const monitoring = getPbxContactInstallMonitoring();

/** `PbxFieldsAdapter` for the `PBX Contact Install` controllers. */
export const contactFieldsAdapter: PbxFieldsAdapter = {
    key: 'contact',
    label: 'Контакт · поля',
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
            monitoring.pbxContactInstallMonitoringGetSmartsByDomain(
                domain,
            ) as unknown as Promise<PbxFieldsMonitoringData>,
        getTemplateFields: () =>
            monitoring.pbxContactInstallMonitoringGetContactFieldsParseData(
                variant as PbxAppName,
                group as PbxGroup,
            ) as unknown as Promise<PbxTemplateField[]>,
        searchFields: (domain, search) =>
            monitoring.pbxContactInstallMonitoringGetPbxContactField(
                domain,
                group as PbxGroup,
                search,
            ) as unknown as Promise<PbxFieldsMonitoringData>,
        installFromTemplate: (domain) =>
            install.pbxContactInstallInstallContactFields(
                domain,
                group as PbxGroup,
                variant as PbxAppName,
            ),
        installFields: (domain, fields) =>
            install.pbxContactInstallInstallContactFieldsByFieldsData({
                domain,
                fields,
            }),
        deleteFields: (domain, codes) =>
            install.pbxContactInstallDeleteContactFields({ domain, codes }),
        deleteFieldItem: (domain, fieldCode, itemCode) =>
            install.pbxContactInstallDeleteContactFieldItem({
                domain,
                fieldCode,
                itemCode,
            }),
        editFieldItem: (domain, fieldCode, itemCode, newValue) =>
            install.pbxContactInstallEditContactFieldItem({
                domain,
                fieldCode,
                itemCode,
                newValue,
            }),
    }),
};
