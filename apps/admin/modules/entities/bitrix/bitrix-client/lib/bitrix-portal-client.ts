import { Bitrix, BitrixService } from '@workspace/bitrix';
import { IBXUser } from '@bitrix/domain/interfaces/bitrix.interface';

/**
 * Default mock admin user used for server-to-Bitrix calls from the admin panel.
 * Replace with real user data if authentication is wired up.
 */
const ADMIN_BX_USER: IBXUser = {
    ID: '1',
    NAME: 'Admin',
    LAST_NAME: '',
    EMAIL: 'admin@localhost',
};

/**
 * Per-portal Bitrix client registry.
 *
 * Solves the singleton problem of the original Bitrix class:
 * - keeps one BitrixService per domain (not a global singleton)
 * - async init is performed once per domain, then cached
 * - safe to call from concurrent react-query queryFns
 */
class BitrixPortalClientManager {
    private clients = new Map<string, BitrixService>();
    private pending = new Map<string, Promise<BitrixService>>();

    /**
     * Returns (or creates) a BitrixService for the given domain.
     * Concurrent callers for the same domain share the same in-flight Promise.
     */
    async getClient(domain: string): Promise<BitrixService> {
        const cached = this.clients.get(domain);
        if (cached) return cached;

        const inFlight = this.pending.get(domain);
        if (inFlight) return inFlight;

        const initPromise = (async () => {
            const service = new BitrixService();
            await service.init(domain, ADMIN_BX_USER);
            this.clients.set(domain, service);
            this.pending.delete(domain);
            return service;
        })();

        this.pending.set(domain, initPromise);
        return initPromise;
    }

    /**
     * Invalidate the cached client for a domain.
     * Call when the portal domain changes or on logout.
     */
    invalidate(domain: string) {
        this.clients.delete(domain);
        this.pending.delete(domain);
    }
}

/**
 * Singleton manager instance (module-level, not Bitrix-class-level).
 * Safe because it's a Map — each domain gets its own service.
 */
export const bitrixPortalClient = new BitrixPortalClientManager();
