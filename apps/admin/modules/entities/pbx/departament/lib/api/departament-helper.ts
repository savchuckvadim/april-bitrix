import {
    getPbxDepartamentInstall,
    getPbxDepartamentInstallMonitoring,
    type UpdatePortalDepartamentDto,
} from '@workspace/nest-pbx-install-api';
import '@/modules/entities/pbx/lib/pbx-install-client';
import type { PbxGroup } from '../../../lib/model/common';

/**
 * `PBX Departament Install` + monitoring. Departament is PortalDB-centric: the
 * Bitrix department already exists (its id is passed in), so install upserts the
 * PortalDB row and monitoring returns merged read-only state.
 */
export class DepartamentHelper {
    private install = getPbxDepartamentInstall();
    private monitoring = getPbxDepartamentInstallMonitoring();

    getMonitoring(domain: string): Promise<unknown> {
        return this.monitoring.pbxDepartamentInstallMonitoringGetDepartamentData(
            domain,
        ) as unknown as Promise<unknown>;
    }

    /** Read-only list of all Bitrix departments to pick from and assign. */
    getBitrixDepartments(domain: string): Promise<unknown> {
        return this.monitoring.pbxDepartamentInstallMonitoringGetAllBitrixDepartments(
            domain,
        ) as unknown as Promise<unknown>;
    }

    installDepartament(
        domain: string,
        group: PbxGroup,
        bitrixId: number,
    ): Promise<void> {
        return this.install.pbxDepartamentInstallInstallDepartament(
            domain,
            group,
            { bitrixId },
        );
    }

    update(id: number, dto: UpdatePortalDepartamentDto): Promise<void> {
        return this.install.pbxDepartamentInstallUpdate(id, dto);
    }

    remove(id: number): Promise<void> {
        return this.install.pbxDepartamentInstallDelete(id);
    }
}
