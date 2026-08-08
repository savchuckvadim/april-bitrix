import {
    getPbxLeadStageInstall,
    getPbxLeadStageInstallMonitoring,
} from '@workspace/nest-pbx-install-api';
import type { InstallLeadStagesDtoGroup } from '@workspace/nest-pbx-install-api';
import '@/modules/entities/pbx/lib/pbx-install-client';
import type {
    InstallLeadStagesResponse,
    LeadStageMappingScreen,
    LeadStageTemplateItem,
    MapLeadStageItem,
} from '../../model';
import type { PbxGroup } from '../../../../lib/model/common';

/**
 * Единственное место с импортом сгенерированных lead-stage клиентов.
 *
 * Сопоставление (map) НЕ создаёт стадии в Bitrix. Установка (install) —
 * создаёт: аддитивно, только install-стадии шаблона (installMode='create'),
 * чужие статусы портала не трогаются.
 */
export class LeadStagesHelper {
    private install = getPbxLeadStageInstall();
    private monitoring = getPbxLeadStageInstallMonitoring();

    /** Экран сопоставления: шаблон × статусы Bitrix × текущий маппинг из БД. */
    getMappingScreen(
        domain: string,
        group: PbxGroup,
    ): Promise<LeadStageMappingScreen> {
        return this.monitoring.pbxLeadStageInstallMonitoringGetStageMappingScreen(
            domain,
            group,
        ) as unknown as Promise<LeadStageMappingScreen>;
    }

    /** Шаблон стадий лида для группы (из кода). */
    getTemplate(group: PbxGroup): Promise<LeadStageTemplateItem[]> {
        return this.monitoring.pbxLeadStageInstallMonitoringGetStageTemplate(
            group,
        ) as unknown as Promise<LeadStageTemplateItem[]>;
    }

    /** Сохранить сопоставление шаблонных стадий с STATUS_ID Bitrix. */
    mapStages(
        domain: string,
        group: PbxGroup,
        mappings: MapLeadStageItem[],
    ): Promise<void> {
        return this.install.pbxLeadStageInstallMapStages({
            domain,
            group,
            mappings,
        });
    }

    /** Установить install-стадии шаблона в Bitrix (аддитивно). */
    installStages(
        domain: string,
        group: PbxGroup,
        codes?: string[],
    ): Promise<InstallLeadStagesResponse> {
        return this.install.pbxLeadStageInstallInstallStages({
            domain,
            group: group as InstallLeadStagesDtoGroup,
            ...(codes?.length ? { codes } : {}),
        }) as Promise<InstallLeadStagesResponse>;
    }
}
