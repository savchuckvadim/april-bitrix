import { getAdminTranscriptionStore } from "@workspace/nest-admin-api";

export class TranscriptionHelper {

    private api: ReturnType<typeof getAdminTranscriptionStore>;
    constructor() {
        this.api = getAdminTranscriptionStore();
    }
    async list() {
        const response = await this.api.adminTranscriptionStoreFindAll();
        return response;
    }
    async findByDomain(domain: string) {
        // domain is portal domain
        const response = await this.api.adminTranscriptionStoreFindByDomain(domain);
        return response;
    }
    async findByDomainAndUser(domain: string, user: string) {
        // domain is portal domain
        const response = await this.api.adminTranscriptionStoreFindByDomainAndUser(domain, user);
        return response;
    }

    async get(id: string) {
        const response = await this.api.adminTranscriptionStoreFindById(id);
        return response;
    }
}
