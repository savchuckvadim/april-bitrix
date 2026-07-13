import {
    getPbxLeadStageInstall,
    getPbxLeadStageInstallMonitoring,
} from '@workspace/nest-pbx-install-api';
import '@/modules/entities/pbx/lib/pbx-install-client';
import type {
    LeadStageMappingScreen,
    LeadStageTemplateItem,
    MapLeadStageItem,
} from '../../model';
import type { PbxGroup } from '../../../../lib/model/common';

/**
 * Единственное место с импортом сгенерированных lead-stage клиентов.
 * Сопоставление НЕ создаёт стадии в Bitrix — только читает статусы и пишет
 * результат маппинга в PortalDB (`btx_stages`).
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
}
