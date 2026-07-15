import { getBitrixDomainDepartment } from '@workspace/nest-event-sales-api';
import { DepartmentDomain, DepartmentResponse } from '../../model';

/**
 * Единственное место импорта @workspace/nest-event-sales-api для отдела.
 * Замена legacy PHP full/department: POST /api/bitrix/department/sales
 * (реализован на бэке, Redis-кэш на день).
 */
export class DepartmentHelper {
    private api: ReturnType<typeof getBitrixDomainDepartment>;

    constructor() {
        this.api = getBitrixDomainDepartment();
    }

    /** Отдел продаж портала со всеми пользователями. */
    async getSalesDepartment(domain: string): Promise<DepartmentResponse> {
        return this.api.departmentEndpointGetFullDepartment({
            domain: domain as DepartmentDomain,
        });
    }
}
