import { getBitrixDomainDepartment } from '@workspace/nest-kpi-report-sales-api';
import type {
    DepartmentStructureDto,
    DepartmentStructureRequest,
} from '../../model';

/**
 * Единственное место импорта клиента department из api-пакета.
 * POST /api/bx/department/structure: бэк сам решает по БД портала,
 * моно это портал или мульти (is_multiple/multiple_tag).
 */
export class DepartmentHelper {
    private api: ReturnType<typeof getBitrixDomainDepartment>;

    constructor() {
        this.api = getBitrixDomainDepartment();
    }

    async getStructure(
        dto: DepartmentStructureRequest,
    ): Promise<DepartmentStructureDto> {
        return (await this.api.bxDepartmentStructureGetStructure(
            dto,
        )) as DepartmentStructureDto;
    }
}
