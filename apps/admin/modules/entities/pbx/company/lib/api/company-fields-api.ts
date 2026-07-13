import {
    getPbxCompanyInstall,
    getPbxCompanyInstallMonitoring,
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

const install = getPbxCompanyInstall();
const monitoring = getPbxCompanyInstallMonitoring();

/** `PbxFieldsAdapter` for the `PBX Company Install` controllers. */
export const companyFieldsAdapter: PbxFieldsAdapter = {
    key: 'company',
    label: 'Компания · поля',
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
            monitoring.pbxCompanyInstallMonitoringGetSmartsByDomain(
                domain,
            ) as unknown as Promise<PbxFieldsMonitoringData>,
        getTemplateFields: () =>
            monitoring.pbxCompanyInstallMonitoringGetCompanyFieldsParseData(
                variant as PbxAppName,
                group as PbxGroup,
            ) as unknown as Promise<PbxTemplateField[]>,
        searchFields: (domain, search) =>
            monitoring.pbxCompanyInstallMonitoringGetPbxCompanyField(
                domain,
                group as PbxGroup,
                search,
            ) as unknown as Promise<PbxFieldsMonitoringData>,
        installFromTemplate: (domain) =>
            install.pbxCompanyInstallInstallCompanyFields(
                domain,
                group as PbxGroup,
                variant as PbxAppName,
            ),
        installFields: (domain, fields) =>
            install.pbxCompanyInstallInstallCompanyFieldsByFieldsData({
                domain,
                fields,
            }),
        deleteFields: (domain, codes) =>
            install.pbxCompanyInstallDeleteCompanyFields({ domain, codes }),
        deleteFieldItem: (domain, fieldCode, itemCode) =>
            install.pbxCompanyInstallDeleteCompanyFieldItem({
                domain,
                fieldCode,
                itemCode,
            }),
        editFieldItem: (domain, fieldCode, itemCode, newValue) =>
            install.pbxCompanyInstallEditCompanyFieldItem({
                domain,
                fieldCode,
                itemCode,
                newValue,
            }),
    }),
};
