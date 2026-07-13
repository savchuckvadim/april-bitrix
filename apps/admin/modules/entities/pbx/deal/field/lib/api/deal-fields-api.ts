import {
    getPbxDealFieldInstall,
    getPbxDealFieldInstallMonitoring,
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

const install = getPbxDealFieldInstall();
const monitoring = getPbxDealFieldInstallMonitoring();

/** `PbxFieldsAdapter` for the `PBX Deal Field Install` controllers. */
export const dealFieldsAdapter: PbxFieldsAdapter = {
    key: 'deal-field',
    label: 'Сделка · поля',
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
            monitoring.pbxDealFieldInstallMonitoringGetSmartsByDomain(
                domain,
            ) as unknown as Promise<PbxFieldsMonitoringData>,
        getTemplateFields: () =>
            monitoring.pbxDealFieldInstallMonitoringGetDealFieldsParseData(
                variant as PbxAppName,
                group as PbxGroup,
            ) as unknown as Promise<PbxTemplateField[]>,
        searchFields: (domain, search) =>
            monitoring.pbxDealFieldInstallMonitoringGetPbxDealField(
                domain,
                group as PbxGroup,
                search,
            ) as unknown as Promise<PbxFieldsMonitoringData>,
        installFromTemplate: (domain) =>
            install.pbxDealFieldInstallInstallDealFields(
                domain,
                group as PbxGroup,
                variant as PbxAppName,
            ),
        installFields: (domain, fields) =>
            install.pbxDealFieldInstallInstallDealFieldsByFieldsData({
                domain,
                fields,
            }),
        deleteFields: (domain, codes) =>
            install.pbxDealFieldInstallDeleteDealFields({ domain, codes }),
        deleteFieldItem: (domain, fieldCode, itemCode) =>
            install.pbxDealFieldInstallDeleteDealFieldItem({
                domain,
                fieldCode,
                itemCode,
            }),
        editFieldItem: (domain, fieldCode, itemCode, newValue) =>
            install.pbxDealFieldInstallEditDealFieldItem({
                domain,
                fieldCode,
                itemCode,
                newValue,
            }),
    }),
};
