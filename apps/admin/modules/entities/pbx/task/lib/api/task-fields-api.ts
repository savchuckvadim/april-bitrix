import {
    getPbxTaskInstall,
    getPbxTaskInstallMonitoring,
} from '@workspace/nest-pbx-install-api';
import '@/modules/entities/pbx/lib/pbx-install-client';
import type { PbxFieldsAdapter } from '../../../fields';
import type {
    PbxBitrixField,
    PbxFieldsMonitoringData,
    PbxTemplateField,
} from '../../../lib/model/common';

const install = getPbxTaskInstall();
const monitoring = getPbxTaskInstallMonitoring();

/**
 * `PbxFieldsAdapter` for `PBX Task Install`. Tasks are Bitrix-only (no PortalDB
 * mirror, no enum items): the monitoring endpoint compares the constants
 * template (`TASK_FIELDS`) against live Bitrix `UF_TASK_*` fields. The template
 * list comes from the domain-independent `/parse` endpoint. "Установить весь
 * шаблон" installs straight from constants.
 */
export const taskFieldsAdapter: PbxFieldsAdapter = {
    key: 'task',
    label: 'Задача · поля',
    capabilities: {
        monitoring: true,
        template: true,
        items: false,
        installFromConstants: false,
    },
    groupOptions: [],
    variantOptions: [],
    variantLabel: '',
    create: () => ({
        getMonitoringData: async (domain): Promise<PbxFieldsMonitoringData> => {
            const res =
                await monitoring.pbxTaskInstallMonitoringGetByDomain(domain);
            return {
                mergedFields: res.mergedFields.map((m) => ({
                    name: m.name,
                    p: null,
                    bx: (m.bx ?? null) as unknown as PbxBitrixField | null,
                })),
                bitrixFieldsWithoutMerged:
                    res.bitrixFieldsWithoutTemplate as unknown as PbxBitrixField[],
            };
        },
        getTemplateFields: (): Promise<PbxTemplateField[]> =>
            monitoring.pbxTaskInstallMonitoringGetTaskFields(),
        installFromTemplate: (domain) =>
            install.pbxTaskFieldInstallInstallTaskFields(domain),
        installFields: (domain, fields) =>
            install.pbxTaskFieldInstallInstallTaskFieldsByFieldsData({
                domain,
                fields,
            }),
        deleteFields: (domain, codes) =>
            install.pbxTaskFieldInstallDeleteTaskFields({ domain, codes }),
    }),
};
