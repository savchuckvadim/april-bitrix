import { getKonstructor } from '@workspace/nest-konstructor-api';
import type { InitV2Data } from '../../model/dto';

/**
 * Единственное место импорта функций @workspace/nest-konstructor-api
 * в слайсе catalog. customAxios пакета разворачивает конверт
 * { resultCode, data } сам.
 */
export class CatalogHelper {
    private api: ReturnType<typeof getKonstructor>;

    constructor() {
        this.api = getKonstructor();
    }

    async getInitData(domain: string): Promise<InitV2Data> {
        return await this.api.konstructorInitInit({ domain });
    }
}
