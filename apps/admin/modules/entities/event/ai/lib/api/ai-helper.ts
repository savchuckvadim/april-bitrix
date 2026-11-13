import { getAdminAi, type AdminAiFindPageParams } from "@workspace/nest-admin-api";

export class AiHelper {
    private api: ReturnType<typeof getAdminAi>;

    constructor() {
        this.api = getAdminAi();
    }

    /** Страница записей: свежие первыми, общее число под фильтром. */
    async page(params: AdminAiFindPageParams) {
        return this.api.adminAiFindPage(params);
    }

    /** Значения фильтров с числом записей; с доменом — только по порталу. */
    async facets(domain?: string) {
        return this.api.adminAiFacets(domain ? { domain } : undefined);
    }

    async get(id: string) {
        return this.api.adminAiFindOne(id);
    }
}
