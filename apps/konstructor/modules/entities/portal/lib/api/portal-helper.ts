import { getFrontPortal } from '@workspace/nest-konstructor-api';
import type { Portal } from '../../model/dto';

/** Слепок портала — единственное место импорта api-пакета для portal-слайса. */
export class PortalHelper {
    private api = getFrontPortal();

    async fetch(domain: string): Promise<Portal> {
        const { portal } = await this.api.frontPortalGetPortal({ domain });
        return portal;
    }
}
