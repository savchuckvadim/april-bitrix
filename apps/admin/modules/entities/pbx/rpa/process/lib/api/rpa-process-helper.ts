import { getPbxRpaInstall } from '@workspace/nest-pbx-install-api';
import '@/modules/entities/pbx/lib/pbx-install-client';
import type { RpaName, TypedGroup } from '../../../../lib/model/common';

/** `PBX RPA Install` orchestrator: install/list/delete a whole RPA process. */
export class RpaProcessHelper {
    private api = getPbxRpaInstall();

    getRpas(domain: string): Promise<unknown> {
        return this.api.pbxRpaInstallGetRpasByDomain(
            domain,
        ) as unknown as Promise<unknown>;
    }

    installRpa(
        domain: string,
        rpaName: RpaName,
        group: TypedGroup,
    ): Promise<void> {
        return this.api.pbxRpaInstallInstallRpa(domain, rpaName, group);
    }

    deleteRpa(
        domain: string,
        rpaName: RpaName,
        withBitrix: boolean,
    ): Promise<void> {
        return this.api.pbxRpaInstallDeleteRpa(domain, rpaName, { withBitrix });
    }
}
