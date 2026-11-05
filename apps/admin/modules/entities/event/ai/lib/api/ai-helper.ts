import { getAdminAi, type AdminAiFindPageParams } from "@workspace/nest-admin-api";

export class AiHelper {
    private api: ReturnType<typeof getAdminAi>;

    constructor() {
        this.api = getAdminAi();
    }

    async list() {
        const response = await this.api.adminAiFindAll();
        return response;
    }

    /** Страница записей: свежие первыми, общее число под фильтром. */
    async page(params: AdminAiFindPageParams) {
        const response = await this.api.adminAiFindPage(params);
        return response;
    }

    async findByDomain(domain: string) {
        // domain is portal domain
        const response = await this.api.adminAiFindByDomain(domain);
        return response;
    }

    async findByDomainAndUser(domain: string, user: string) {
        // domain is portal domain
        const response = await this.api.adminAiFindByDomainAndUser(domain, user);
        return response;
    }

    async get(id: string) {
        const response = await this.api.adminAiFindOne(id);
        return response;
    }
}
