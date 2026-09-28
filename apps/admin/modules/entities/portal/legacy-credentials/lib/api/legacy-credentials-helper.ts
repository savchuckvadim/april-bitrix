import { getPortalOuter } from '@workspace/nest-admin-api';
import type { LegacyCredentials, LegacyCredentialsSave } from '../../model';

/**
 * Единственное место импорта клиента `portal-outer`: креды портала в
 * Laravel (online). Laravel шифрует их своим APP_KEY, поэтому писать их
 * можно только через него, прямая запись в БД сломает расшифровку.
 */
export class LegacyCredentialsHelper {
    private api = getPortalOuter();

    /** Текущие креды портала (расшифрованные Laravel). */
    async get(domain: string): Promise<LegacyCredentials> {
        const portal = await this.api.portalOuterGetPortalByDomain(domain);
        return (portal ?? {}) as unknown as LegacyCredentials;
    }

    /** Записать креды; после успеха бэк сбрасывает слепок `portal_${domain}`. */
    save(dto: LegacyCredentialsSave): Promise<void> {
        return this.api.portalOuterUpdatePortalByDomain(dto);
    }
}
