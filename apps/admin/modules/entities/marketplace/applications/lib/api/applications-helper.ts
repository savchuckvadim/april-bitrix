import {
    ApprovalActionDto,
    getAdminMarketplaceModeration,
} from '@workspace/nest-admin-api';

/** Обёртка над API модерации маркетплейса: заявки, компоненты, продукты, решения. */
export class ApplicationsHelper {
    private api: ReturnType<typeof getAdminMarketplaceModeration>;

    constructor() {
        this.api = getAdminMarketplaceModeration();
    }

    async list(approvalStatus?: string) {
        return this.api.marketplaceModerationGetApplications(
            approvalStatus ? { approvalStatus } : undefined,
        );
    }

    async decide(portalId: number, dto: ApprovalActionDto) {
        return this.api.marketplaceModerationDecide(portalId, dto);
    }

    async components(portalId: number) {
        return this.api.marketplaceModerationGetComponents(portalId);
    }

    async products(portalId: number) {
        return this.api.marketplaceModerationGetPortalProducts(portalId);
    }

    async provisionRefresh(portalId: number) {
        return this.api.marketplaceModerationProvisionRefresh(portalId);
    }

    async placementsRefresh(portalId: number) {
        return this.api.marketplaceModerationPlacementsRefresh(portalId);
    }
}
