import { getPortalKonstructor } from '@workspace/nest-konstructor-api';
import type { Provider } from '../../model/dto';

/** Поставщики портала — единственное место импорта api-пакета для provider-слайса. */
export class ProviderHelper {
    private api = getPortalKonstructor();

    async list(domain: string): Promise<Provider[]> {
        return (await this.api.providerGetProviderByDomain(domain)) ?? [];
    }
}
