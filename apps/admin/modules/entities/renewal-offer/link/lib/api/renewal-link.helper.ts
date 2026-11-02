import { customAxios } from '@workspace/nest-admin-api';
import { RENEWAL_LINK_API_BASE } from '../../consts/renewal-link.consts';
import type {
    RenewalLink,
    RenewalLinkCreate,
    RenewalLinksRevoked,
} from '../../model';

/**
 * Транспорт ссылок на КП. Руками, пока не прогнан `pnpm run generate`:
 * тот же мутатор `customAxios`, что у сгенерированных клиентов, поэтому
 * после генерации меняются только тела методов.
 */
export class RenewalLinkHelper {
    list(): Promise<RenewalLink[]> {
        return customAxios<RenewalLink[]>({
            url: RENEWAL_LINK_API_BASE,
            method: 'GET',
        });
    }

    create(dto: RenewalLinkCreate): Promise<RenewalLink> {
        return customAxios<RenewalLink>({
            url: RENEWAL_LINK_API_BASE,
            method: 'POST',
            data: dto,
        });
    }

    revoke(id: string): Promise<RenewalLink> {
        return customAxios<RenewalLink>({
            url: `${RENEWAL_LINK_API_BASE}/${id}/revoke`,
            method: 'POST',
        });
    }

    revokeAll(): Promise<RenewalLinksRevoked> {
        return customAxios<RenewalLinksRevoked>({
            url: `${RENEWAL_LINK_API_BASE}/revoke-all`,
            method: 'POST',
        });
    }
}
