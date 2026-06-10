import { getAdminAi } from "@workspace/nest-api";

export class AiHelper {
    private api: ReturnType<typeof getAdminAi>;

    constructor() {
        this.api = getAdminAi();
    }

    async list() {
        const response = await this.api.adminAiFindAll();
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
