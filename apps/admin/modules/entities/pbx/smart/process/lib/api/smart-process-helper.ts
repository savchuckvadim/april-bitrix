import { getPbxSmartInstall } from '@workspace/nest-pbx-install-api';
import '@/modules/entities/pbx/lib/pbx-install-client';
import type { SmartName, TypedGroup } from '../../../../lib/model/common';

/** `PBX Smart Install` orchestrator: install/list/delete a whole smart type. */
export class SmartProcessHelper {
    private api = getPbxSmartInstall();

    getSmarts(domain: string): Promise<unknown> {
        return this.api.pbxSmartInstallGetSmartsByDomain(
            domain,
        ) as unknown as Promise<unknown>;
    }

    installSmart(
        domain: string,
        smartName: SmartName,
        group: TypedGroup,
    ): Promise<void> {
        return this.api.pbxSmartInstallInstallSmart(domain, smartName, group);
    }

    deleteSmart(
        domain: string,
        smartName: SmartName,
        group: TypedGroup,
        withBitrix: boolean,
    ): Promise<void> {
        return this.api.pbxSmartInstallDeleteSmart(domain, smartName, group, {
            withBitrix,
        });
    }
}
