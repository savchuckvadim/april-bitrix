import {
    IssueInviteDto,
    MarketplaceModerationGetInvitesParams,
    ReissueInviteDto,
    getAdminMarketplaceModeration,
} from '@workspace/nest-admin-api';

/**
 * Обёртка над API кодов подключения портала.
 *
 * Открытый код возвращают только issue/reissue и только один раз —
 * в списке его нет (в БД хранится лишь хэш).
 */
export class InvitesHelper {
    private api: ReturnType<typeof getAdminMarketplaceModeration>;

    constructor() {
        this.api = getAdminMarketplaceModeration();
    }

    async list(params?: MarketplaceModerationGetInvitesParams) {
        return this.api.marketplaceModerationGetInvites(params);
    }

    async issue(dto: IssueInviteDto) {
        return this.api.marketplaceModerationIssueInvite(dto);
    }

    async revoke(id: string) {
        return this.api.marketplaceModerationRevokeInvite(id);
    }

    async reissue(id: string, dto: ReissueInviteDto) {
        return this.api.marketplaceModerationReissueInvite(id, dto);
    }

    async delete(id: string) {
        return this.api.marketplaceModerationDeleteInvite(id);
    }
}
