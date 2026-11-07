import { getAdminPortalEmployees } from '@workspace/nest-admin-api';
import type { PortalEmployee } from '../../model';

/**
 * Единственное место импорта `@workspace/nest-admin-api` для сотрудников
 * портала (GET admin/portal/:id/employees).
 */
export class PortalEmployeesHelper {
    private api: ReturnType<typeof getAdminPortalEmployees>;

    constructor() {
        this.api = getAdminPortalEmployees();
    }

    /** refresh — перечитать Битрикс мимо кэша бэка (10 минут). */
    list(portalId: number, refresh = false): Promise<PortalEmployee[]> {
        return this.api.portalEmployeesAdminList(
            portalId,
            refresh ? { refresh: true } : undefined,
        );
    }
}
