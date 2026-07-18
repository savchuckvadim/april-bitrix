import {
    MarketplaceModerationGetEventsParams,
    getAdminMarketplaceModeration,
} from '@workspace/nest-admin-api';

/** Обёртка над API журнала событий приложения (bitrix_app_events). */
export class EventsHelper {
    private api: ReturnType<typeof getAdminMarketplaceModeration>;

    constructor() {
        this.api = getAdminMarketplaceModeration();
    }

    async list(params?: MarketplaceModerationGetEventsParams) {
        return this.api.marketplaceModerationGetEvents(params);
    }
}
