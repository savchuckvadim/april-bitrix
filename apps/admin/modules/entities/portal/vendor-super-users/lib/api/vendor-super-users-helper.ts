import { customAxios } from '@workspace/nest-admin-api';
import type { VendorSuperUser, VendorSuperUserSave } from '../../model';

/**
 * Единственное место в слайсе, где живёт транспорт.
 *
 * Ручки `admin/portal/:portalId/vendor-super-users` ещё не прогнаны через
 * orval, поэтому пути собираются здесь руками поверх того же `customAxios`,
 * что и у сгенерированных клиентов — базовый URL, авторизация и обработка
 * ошибок общие. После `pnpm run generate` правка сводится к замене вызовов
 * на `getAdminVendorSuperUsers()`; наружу класс отдаёт те же методы.
 * Прецедент — `entities/portal/questionnaires`, `entities/pbx/smart/db`.
 */
export class VendorSuperUsersHelper {
    private base(portalId: number): string {
        return `admin/portal/${portalId}/vendor-super-users`;
    }

    /** Все записи портала, включая снятые с доступа. */
    async list(portalId: number): Promise<VendorSuperUser[]> {
        return customAxios<VendorSuperUser[]>({
            url: this.base(portalId),
            method: 'GET',
        });
    }

    /** Завести или обновить: повторный bitrixId правит существующую запись. */
    async save(
        portalId: number,
        payload: VendorSuperUserSave,
    ): Promise<VendorSuperUser> {
        return customAxios<VendorSuperUser>({
            url: this.base(portalId),
            method: 'POST',
            data: payload,
        });
    }

    /** Убрать доступ совсем. Возвращает остаток списка. */
    async remove(
        portalId: number,
        bitrixId: number,
    ): Promise<VendorSuperUser[]> {
        return customAxios<VendorSuperUser[]>({
            url: `${this.base(portalId)}/${bitrixId}`,
            method: 'DELETE',
        });
    }
}
