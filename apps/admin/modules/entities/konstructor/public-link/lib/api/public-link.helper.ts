import { customAxios } from '@workspace/nest-konstructor-api';
import { PUBLIC_LINK_API_BASE } from '../../consts/public-link.consts';
import type { PublicLink, PublicLinkCreate, PublicLinksRevoked } from '../../model';

/**
 * Транспорт публичных ссылок. Руками, пока не прогнан `pnpm run generate`:
 * тот же мутатор `customAxios`, что у сгенерированных клиентов, поэтому после
 * генерации меняются только тела методов.
 */
export class PublicLinkHelper {
    list(): Promise<PublicLink[]> {
        return customAxios<PublicLink[]>({
            url: PUBLIC_LINK_API_BASE,
            method: 'GET',
        });
    }

    create(dto: PublicLinkCreate): Promise<PublicLink> {
        return customAxios<PublicLink>({
            url: PUBLIC_LINK_API_BASE,
            method: 'POST',
            data: dto,
        });
    }

    revoke(id: string): Promise<PublicLink> {
        return customAxios<PublicLink>({
            url: `${PUBLIC_LINK_API_BASE}/${id}/revoke`,
            method: 'POST',
        });
    }

    revokeAll(): Promise<PublicLinksRevoked> {
        return customAxios<PublicLinksRevoked>({
            url: `${PUBLIC_LINK_API_BASE}/revoke-all`,
            method: 'POST',
        });
    }
}
