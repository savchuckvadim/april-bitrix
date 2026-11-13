import {
    getAdminTranscriptionStore,
    type AdminTranscriptionStoreFindPageParams,
} from "@workspace/nest-admin-api";

export class TranscriptionHelper {
    private api: ReturnType<typeof getAdminTranscriptionStore>;

    constructor() {
        this.api = getAdminTranscriptionStore();
    }

    /** Страница списка: фильтры — на сервере, без текста разговора. */
    async page(params: AdminTranscriptionStoreFindPageParams) {
        return this.api.adminTranscriptionStoreFindPage(params);
    }

    /** Значения фильтров с числом записей; с доменом — только по порталу. */
    async facets(domain?: string) {
        return this.api.adminTranscriptionStoreFacets(domain ? { domain } : undefined);
    }

    async get(id: string) {
        return this.api.adminTranscriptionStoreFindById(id);
    }
}
