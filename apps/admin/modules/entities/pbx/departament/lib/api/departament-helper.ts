import {
    getPbxDepartamentInstall,
    getPbxDepartamentInstallMonitoring,
    getPbxPortalDepartamentDb,
    type UpdatePortalDepartamentDto,
} from '@workspace/nest-pbx-install-api';
import '@/modules/entities/pbx/lib/pbx-install-client';
import type { PbxGroup } from '../../../lib/model/common';
import type {
    CreatePortalDepartamentInput,
    DeleteDepartamentResult,
    InstallDepartamentResult,
    PortalDepartament,
    UpdatePortalDepartamentInput,
} from '../model/departament';

/**
 * `PBX Departament Install` + monitoring + full DB CRUD
 * (`pbx/portal-departament`). Departament is PortalDB-centric: the Bitrix
 * department already exists (its id is passed in), so install upserts the
 * PortalDB row and monitoring returns merged read-only state.
 */
export class DepartamentHelper {
    private install = getPbxDepartamentInstall();
    private monitoring = getPbxDepartamentInstallMonitoring();
    private db = getPbxPortalDepartamentDb();

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
    ): Promise<InstallDepartamentResult> {
        return this.install.pbxDepartamentInstallInstallDepartament(
            domain,
            group,
            { bitrixId },
        );
    }

    update(
        id: number,
        dto: UpdatePortalDepartamentDto,
    ): Promise<PortalDepartament> {
        return this.install.pbxDepartamentInstallUpdate(id, dto);
    }

    remove(id: number): Promise<DeleteDepartamentResult> {
        return this.install.pbxDepartamentInstallDelete(id);
    }

    /* --- Full DB CRUD (`pbx/portal-departament`) --- */

    listDb(): Promise<PortalDepartament[]> {
        return this.db.portalDepartamentList();
    }

    listDbByPortal(portalId: number): Promise<PortalDepartament[]> {
        return this.db.portalDepartamentListByPortal(portalId);
    }

    getDbById(id: number): Promise<PortalDepartament> {
        return this.db.portalDepartamentGetById(id);
    }

    createDb(dto: CreatePortalDepartamentInput): Promise<PortalDepartament> {
        return this.db.portalDepartamentCreate(dto);
    }

    updateDb(
        id: number,
        dto: UpdatePortalDepartamentInput,
    ): Promise<PortalDepartament> {
        return this.db.portalDepartamentUpdate(id, dto);
    }

    removeDb(id: number): Promise<void> {
        return this.db.portalDepartamentDelete(id);
    }
}
