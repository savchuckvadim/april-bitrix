import { customAxios } from '@workspace/nest-admin-api';
import type { CabinetGuide } from '../../model';

/**
 * Транспорт путеводителя «Кабинет клиента»: путь собран руками поверх
 * общего `customAxios`, как у раздела портала «Кабинет».
 */
export class CabinetGuideHelper {
    get(): Promise<CabinetGuide> {
        return customAxios<CabinetGuide>({
            url: '/api/admin/cabinet/guide',
            method: 'GET',
        });
    }
}
