import {
    getPbxGroupInstall,
    getPbxGroupInstallMonitoring,
    type PortalCallingResponseDto,
} from '@workspace/nest-pbx-install-api';
import '@/modules/entities/pbx/lib/pbx-install-client';
import type { PbxGroup } from '../../../lib/model/common';

/** `PBX Group Install` (calling group / `sonet_group`) + merged monitoring. */
export class GroupHelper {
    private install = getPbxGroupInstall();
    private monitoring = getPbxGroupInstallMonitoring();

    getMonitoring(domain: string): Promise<unknown> {
        return this.monitoring.pbxGroupInstallMonitoringGetGroupData(
            domain,
        ) as unknown as Promise<unknown>;
    }

    installGroup(domain: string, group: PbxGroup): Promise<void> {
        return this.install.pbxGroupInstallInstallGroup(domain, group);
    }

    /**
     * Bind an existing Bitrix `sonet_group` id to a calling-group slot — upserts
     * `bitrixId` into PortalDB `callings`; nothing is changed in Bitrix.
     */
    setCallingBitrixId(
        domain: string,
        group: PbxGroup,
        bitrixId: number,
    ): Promise<PortalCallingResponseDto> {
        return this.install.pbxGroupInstallSetBitrixId({
            domain,
            group,
            bitrixId,
        });
    }
}
