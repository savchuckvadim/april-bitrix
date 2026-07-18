import {
    MarketplaceModerationGetInstallsParams,
    getAdminMarketplaceModeration,
} from '@workspace/nest-admin-api';

/** Обёртка над API установок маркетплейс-приложения. */
export class InstallsHelper {
    private api: ReturnType<typeof getAdminMarketplaceModeration>;

    constructor() {
        this.api = getAdminMarketplaceModeration();
    }

    async list(params?: MarketplaceModerationGetInstallsParams) {
        return this.api.marketplaceModerationGetInstalls(params);
    }

    async get(installId: string) {
        return this.api.marketplaceModerationGetInstall(installId);
    }
}
