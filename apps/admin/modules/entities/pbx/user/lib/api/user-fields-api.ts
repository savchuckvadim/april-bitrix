import {
    getPbxUserInstall,
    getPbxUserInstallMonitoring,
} from '@workspace/nest-pbx-install-api';
import '@/modules/entities/pbx/lib/pbx-install-client';
import type { PbxFieldsAdapter } from '../../../fields';
import type {
    PbxBitrixField,
    PbxFieldsMonitoringData,
    PbxInstalledField,
    PbxTemplateField,
} from '../../../lib/model/common';

const install = getPbxUserInstall();
const monitoring = getPbxUserInstallMonitoring();

/**
 * `PbxFieldsAdapter` for `PBX User Install`. Unlike CRM entities there's no
 * group/variant axis and no Excel: the source of truth is the constants
 * (`USER_FIELDS`). The 3-layer monitoring endpoint returns, per field, the
 * template (constants), the PortalDB record and the live Bitrix field — so both
 * the installed list and the template column are derived from one response.
 * "Установить весь шаблон" installs straight from constants.
 */
export const userFieldsAdapter: PbxFieldsAdapter = {
    key: 'user',
    label: 'Пользователь · поля',
    capabilities: {
        monitoring: true,
        template: true,
        items: true,
        installFromConstants: false,
    },
    groupOptions: [],
    variantOptions: [],
    variantLabel: '',
    create: () => ({
        getMonitoringData: async (domain): Promise<PbxFieldsMonitoringData> => {
            const res =
                await monitoring.pbxUserInstallMonitoringGetByDomain(domain);
            return {
                mergedFields: res.mergedFields.map((m) => ({
                    name: m.name,
                    p: (m.db ?? null) as unknown as PbxInstalledField | null,
                    bx: (m.bx ?? null) as unknown as PbxBitrixField | null,
                })),
                portalFieldsWithoutMerged:
                    res.dbFieldsWithoutMerged as unknown as PbxInstalledField[],
                bitrixFieldsWithoutMerged:
                    res.bitrixFieldsWithoutMerged as unknown as PbxBitrixField[],
            };
        },
        getTemplateFields: (): Promise<PbxTemplateField[]> =>
            monitoring.pbxUserInstallMonitoringGetUserFields(),
        installFromTemplate: (domain) =>
            install.pbxUserFieldInstallInstallUserFields(domain),
        installFields: (domain, fields) =>
            install.pbxUserFieldInstallInstallUserFieldsByFieldsData({
                domain,
                fields,
            }),
        deleteFields: (domain, codes) =>
            install.pbxUserFieldInstallDeleteUserFields({ domain, codes }),
        deleteFieldItem: (domain, fieldCode, itemCode) =>
            install.pbxUserFieldInstallDeleteUserFieldItem({
                domain,
                fieldCode,
                itemCode,
            }),
        editFieldItem: (domain, fieldCode, itemCode, newValue) =>
            install.pbxUserFieldInstallEditUserFieldItem({
                domain,
                fieldCode,
                itemCode,
                newValue,
            }),
    }),
};
