import { customAxios } from '@workspace/nest-admin-api';
import type {
    CabinetBitrixAppCheck,
    CabinetBitrixAppConnection,
    CabinetBitrixAppKeys,
} from '../../model';

/**
 * «Подключение Битрикс24» портала (бэк: @lib/cabinet
 * `admin/cabinet/portals/:portalId/bitrix-app`) — пути руками поверх
 * общего `customAxios`, как у остального раздела «Кабинет».
 */
export class CabinetBitrixAppHelper {
    private base(portalId: number): string {
        return `/api/admin/cabinet/portals/${portalId}/bitrix-app`;
    }

    status(portalId: number): Promise<CabinetBitrixAppConnection> {
        return customAxios<CabinetBitrixAppConnection>({
            url: this.base(portalId),
            method: 'GET',
        });
    }

    saveKeys(
        portalId: number,
        keys: CabinetBitrixAppKeys,
    ): Promise<CabinetBitrixAppConnection> {
        return customAxios<CabinetBitrixAppConnection>({
            url: `${this.base(portalId)}/keys`,
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            data: keys,
        });
    }

    check(portalId: number): Promise<CabinetBitrixAppCheck> {
        return customAxios<CabinetBitrixAppCheck>({
            url: `${this.base(portalId)}/check`,
            method: 'POST',
        });
    }
}
