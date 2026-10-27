import { getAdminPortalBadges } from '@workspace/nest-admin-api';
import type { BadgeSchema, PortalBadges, PortalBadgesSave } from '../../model';

/**
 * Единственное место импорта транспорта `@workspace/nest-admin-api` для
 * каталога бейджиков портала (`admin/portal/:portalId/badges`).
 *
 * Сохранение — PUT целиком: режим и свой набор; бэк отвечает тем же
 * документом, что и чтение, поэтому ответ можно класть в кэш списка.
 */
export class BadgesHelper {
    private api: ReturnType<typeof getAdminPortalBadges>;

    constructor() {
        this.api = getAdminPortalBadges();
    }

    /** Реестр значений с подписями — одинаков для всех порталов. */
    getSchema(portalId: number): Promise<BadgeSchema> {
        return this.api.portalBadgesGetSchema(portalId);
    }

    /** Режим, свой набор и общий набор для сравнения. */
    get(portalId: number): Promise<PortalBadges> {
        return this.api.portalBadgesGet(portalId);
    }

    /** Сохранить режим и свой набор целиком. */
    save(portalId: number, dto: PortalBadgesSave): Promise<PortalBadges> {
        return this.api.portalBadgesSave(portalId, dto);
    }
}
