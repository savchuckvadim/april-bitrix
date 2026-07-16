import {
    customAxios,
    getPbxDepartamentInstall,
    getPbxDepartamentInstallMonitoring,
    type UpdatePortalDepartamentDto,
} from '@workspace/nest-pbx-install-api';
import '@/modules/entities/pbx/lib/pbx-install-client';
import type { PbxGroup } from '../../../lib/model/common';
import type {
    CreatePortalDepartamentInput,
    PortalDepartament,
    UpdatePortalDepartamentInput,
} from '../model/departament';

/** Base path of the full-CRUD `PBX Portal Departament (DB)` controller. */
const DB_URL = '/pbx/portal-departament';

/**
 * `PBX Departament Install` + monitoring. Departament is PortalDB-centric: the
 * Bitrix department already exists (its id is passed in), so install upserts the
 * PortalDB row and monitoring returns merged read-only state.
 *
 * DB CRUD (`pbx/portal-departament`) is called through `customAxios` directly —
 * the orval client has not been regenerated against the updated backend yet.
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

    /* --- Full DB CRUD (`pbx/portal-departament`) --- */

    listDb(): Promise<PortalDepartament[]> {
        return customAxios<PortalDepartament[]>({ method: 'GET', url: DB_URL });
    }

    listDbByPortal(portalId: number): Promise<PortalDepartament[]> {
        return customAxios<PortalDepartament[]>({
            method: 'GET',
            url: `${DB_URL}/by-portal/${portalId}`,
        });
    }

    getDbById(id: number): Promise<PortalDepartament> {
        return customAxios<PortalDepartament>({
            method: 'GET',
            url: `${DB_URL}/${id}`,
        });
    }

    createDb(dto: CreatePortalDepartamentInput): Promise<PortalDepartament> {
        return customAxios<PortalDepartament>({
            method: 'POST',
            url: DB_URL,
            data: dto,
        });
    }

    updateDb(
        id: number,
        dto: UpdatePortalDepartamentInput,
    ): Promise<PortalDepartament> {
        return customAxios<PortalDepartament>({
            method: 'PATCH',
            url: `${DB_URL}/${id}`,
            data: dto,
        });
    }

    removeDb(id: number): Promise<void> {
        return customAxios<void>({
            method: 'DELETE',
            url: `${DB_URL}/${id}`,
        });
    }
}