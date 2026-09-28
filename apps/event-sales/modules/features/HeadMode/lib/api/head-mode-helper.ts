import { getBitrixDomainDepartment } from '@workspace/nest-event-sales-api';
import type { HeadCurrentUser, HeadStructureDomain } from '../../model';

/**
 * Единственное место импорта @workspace/nest-event-sales-api для режима
 * руководителя: POST /api/bx/department/structure — роль пользователя и
 * его подчинённые (структура кэшируется на бэке на сутки).
 */
export class HeadModeHelper {
    private api: ReturnType<typeof getBitrixDomainDepartment>;

    constructor() {
        this.api = getBitrixDomainDepartment();
    }

    /** Роль пользователя в отделе продаж вместе со списком подчинённых. */
    async getCurrentUser(
        domain: string,
        userId: number,
    ): Promise<HeadCurrentUser> {
        const response = await this.api.bxDepartmentStructureGetStructure({
            domain: domain as HeadStructureDomain,
            userId,
        });
        return response.currentUser;
    }
}
