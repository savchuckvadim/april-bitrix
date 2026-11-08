import { customAxios } from '@workspace/nest-admin-api';
import type { PortalBitrixLoad } from '../../model';

/**
 * Нагрузка портала на Битрикс (бэк admin: `PortalBitrixLoadController`) —
 * путь руками поверх общего `customAxios`, он снимает конверт ответа.
 */
export class BitrixLoadHelper {
    get(portalId: number, hours: number): Promise<PortalBitrixLoad> {
        return customAxios<PortalBitrixLoad>({
            url: `/api/admin/portal/${portalId}/bitrix-load`,
            method: 'GET',
            params: { hours },
        });
    }
}
