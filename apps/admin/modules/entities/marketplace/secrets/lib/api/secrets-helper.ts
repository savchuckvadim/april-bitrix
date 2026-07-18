import {
    UpsertAppSecretDto,
    getAdminBitrixAppSecrets,
} from '@workspace/nest-admin-api';

/** Обёртка над API OAuth-кред приложений (bitrix_app_secrets). */
export class SecretsHelper {
    private api: ReturnType<typeof getAdminBitrixAppSecrets>;

    constructor() {
        this.api = getAdminBitrixAppSecrets();
    }

    async list() {
        return this.api.bitrixAppSecretsFindAll();
    }

    async get(code: string) {
        return this.api.bitrixAppSecretsFindByCode(code);
    }

    async upsert(code: string, dto: UpsertAppSecretDto) {
        return this.api.bitrixAppSecretsUpsert(code, dto);
    }

    async delete(code: string) {
        return this.api.bitrixAppSecretsDelete(code);
    }
}
