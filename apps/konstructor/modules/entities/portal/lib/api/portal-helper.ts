import { customAxios, getFrontPortal } from '@workspace/nest-konstructor-api';
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
     * читает из БД лишь их. Запрос написан руками: ручка появилась 16.11, до
     * `pnpm generate` в @workspace/nest-konstructor-api клиента для неё нет —
     * после генерации заменить на сгенерированную функцию.
     */
    async fetchParts(domain: string, query: PortalPartsQuery): Promise<PortalParts> {
        return customAxios<PortalParts>({
            url: '/api/front/portal/parts',
            method: 'POST',
            data: { domain, ...query },
        });
    }
}
