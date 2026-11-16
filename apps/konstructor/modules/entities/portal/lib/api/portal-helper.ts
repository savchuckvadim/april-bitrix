import { getFrontPortal } from '@workspace/nest-konstructor-api';
import type { Portal, PortalParts, PortalPartsQuery } from '../../model/dto';

/** Слепок портала — единственное место импорта api-пакета для portal-слайса. */
export class PortalHelper {
    private api = getFrontPortal();

    /** Полная модель портала (около мегабайта) — запасной путь */
    async fetch(domain: string): Promise<Portal> {
        const { portal } = await this.api.frontPortalGetPortal({ domain });
        return portal;
    }

    /**
     * Только названные части портала (`POST /api/front/portal/parts`): бэк
     * читает из БД лишь их.
     */
    async fetchParts(domain: string, query: PortalPartsQuery): Promise<PortalParts> {
        return this.api.frontPortalGetPortalParts({ domain, ...query });
    }
}
