import { customAxios } from '@workspace/nest-admin-api';
import type {
    CabinetAddMember,
    CabinetInviteResult,
    CabinetMember,
    CabinetNewClient,
    CabinetPasswordLink,
    CabinetPortalCard,
    CabinetWidgetsResult,
} from '../../model';

/**
 * Транспорт раздела «Кабинет» (бэк: apps/admin → @lib/cabinet
 * `admin/cabinet/portals/:portalId`). Пути собраны руками поверх общего
 * `customAxios` (базовый URL, Bearer админки, распаковка конверта) до
 * прогона orval — как у `entities/portal/vendor-super-users`.
 */
export class CabinetHelper {
    private base(portalId: number): string {
        return `/api/admin/cabinet/portals/${portalId}`;
    }

    card(portalId: number): Promise<CabinetPortalCard> {
        return customAxios<CabinetPortalCard>({
            url: this.base(portalId),
            method: 'GET',
        });
    }

    attachClient(
        portalId: number,
        clientId: number | null,
    ): Promise<CabinetPortalCard> {
        return customAxios<CabinetPortalCard>({
            url: `${this.base(portalId)}/client`,
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            data: { clientId },
        });
    }

    /** Завести организацию и сразу привязать к ней портал. */
    createClient(
        portalId: number,
        payload: CabinetNewClient,
    ): Promise<CabinetPortalCard> {
        return customAxios<CabinetPortalCard>({
            url: `${this.base(portalId)}/client`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            data: payload,
        });
    }

    invite(
        portalId: number,
        payload: CabinetAddMember,
    ): Promise<CabinetInviteResult> {
        return customAxios<CabinetInviteResult>({
            url: `${this.base(portalId)}/members`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            data: payload,
        });
    }

    approve(portalId: number, membershipId: string): Promise<CabinetMember> {
        return customAxios<CabinetMember>({
            url: `${this.base(portalId)}/members/${membershipId}/approve`,
            method: 'POST',
        });
    }

    makeOwner(portalId: number, membershipId: string): Promise<CabinetMember> {
        return customAxios<CabinetMember>({
            url: `${this.base(portalId)}/members/${membershipId}/make-owner`,
            method: 'POST',
        });
    }

    passwordLink(
        portalId: number,
        membershipId: string,
    ): Promise<CabinetPasswordLink> {
        return customAxios<CabinetPasswordLink>({
            url: `${this.base(portalId)}/members/${membershipId}/password-link`,
            method: 'POST',
        });
    }

    revoke(portalId: number, membershipId: string): Promise<{ ok: boolean }> {
        return customAxios<{ ok: boolean }>({
            url: `${this.base(portalId)}/members/${membershipId}`,
            method: 'DELETE',
        });
    }

    revokeTelegram(
        portalId: number,
        bindingId: string,
    ): Promise<{ ok: boolean }> {
        return customAxios<{ ok: boolean }>({
            url: `${this.base(portalId)}/telegram/${bindingId}`,
            method: 'DELETE',
        });
    }

    /**
     * Виджеты портала под его список app_widgets; force — снять все наши
     * привязки и поставить заново. Ручка модерации маркетплейса (прокси в
     * pbx), работает и для действующих порталов.
     */
    refreshWidgets(
        portalId: number,
        force: boolean,
    ): Promise<CabinetWidgetsResult> {
        return customAxios<CabinetWidgetsResult>({
            url: `/api/admin/marketplace/portals/${portalId}/placements-refresh`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            data: { force },
        });
    }
}
