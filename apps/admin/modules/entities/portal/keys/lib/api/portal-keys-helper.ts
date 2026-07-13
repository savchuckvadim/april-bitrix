import { getAdminPortalKeys } from '@workspace/nest-pbx-install-api';
import '@/modules/entities/pbx/lib/pbx-install-client';
import type { PortalKey, PortalKeyName, PortalKeys } from '../../model';

/**
 * Единственное место с импортом сгенерированного `admin-portal-keys` клиента.
 * Значения ключей хранятся в БД зашифрованными и отдаются наружу расшифрованными.
 */
export class PortalKeysHelper {
    private api = getAdminPortalKeys();

    /** Все ключи портала (расшифрованные). */
    getAll(portalId: number): Promise<PortalKeys> {
        return this.api.portalKeysGetAll(portalId);
    }

    /** Один ключ портала. */
    getOne(portalId: number, keyName: PortalKeyName): Promise<PortalKey> {
        return this.api.portalKeysGetOne(portalId, keyName);
    }

    /** Задать/обновить значение ключа (шифруется на бэке). */
    set(
        portalId: number,
        keyName: PortalKeyName,
        value: string,
    ): Promise<PortalKey> {
        return this.api.portalKeysSet(portalId, keyName, { value });
    }

    /** Очистить ключ (записывает null). */
    remove(portalId: number, keyName: PortalKeyName): Promise<PortalKey> {
        return this.api.portalKeysRemove(portalId, keyName);
    }
}
