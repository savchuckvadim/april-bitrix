import type { PbxSmartInstallTarget, PbxSmartMappingTarget } from '../model/types';

/**
 * Helper class for PBX install / sync operations.
 *
 * TODO: replace mock implementations with real API calls once the back-end
 * exposes install endpoints (e.g. POST /admin/pbx/smarts/install).
 * The contract: client sends a PbxSmartInstallTarget and the back-end
 * installs the node in Bitrix, stores the result (bitrixId, etc.) in DB,
 * and returns the updated record.
 */
export class PbxSmartInstallHelper {
    /**
     * Install a single node (smart / category / stage / field / field-item)
     * from the PBX registry template into the given portal.
     *
     * @returns void for now; will return the created/updated DB record once
     *          the real endpoint exists.
     */
    async installNode(target: PbxSmartInstallTarget): Promise<void> {
        // MOCK — log and resolve immediately
        console.info('[PbxSmartInstall] installNode (mock)', target);
        await Promise.resolve();
    }

    /**
     * Re-sync an already-installed node with the current template definition.
     * Useful when the template was updated after the initial install.
     */
    async syncNode(target: PbxSmartInstallTarget): Promise<void> {
        // MOCK
        console.info('[PbxSmartInstall] syncNode (mock)', target);
        await Promise.resolve();
    }

    /**
     * Record a manual mapping between a template node and an existing Bitrix entity.
     * Does NOT call Bitrix — only writes to our DB.
     *
     * TODO: replace mock with real API call once the back-end exposes
     *   POST /admin/pbx/smarts/map-node
     */
    async mapNode(target: PbxSmartMappingTarget): Promise<void> {
        // MOCK — log and resolve
        console.info('[PbxSmartInstall] mapNode (mock)', target);
        await Promise.resolve();
    }
}
