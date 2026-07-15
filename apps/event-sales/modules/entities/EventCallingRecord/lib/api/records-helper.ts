import { getEventSalesBxRecords } from '@workspace/nest-event-sales-api';
import { EvCallingRecordDto, EvRecordsByCompanyDto } from '../../model';

/**
 * Единственное место импорта @workspace/nest-event-sales-api для записей.
 * POST /api/event-sales-bx-records/company (замена legacy backAPI).
 */
export class RecordsHelper {
    private api: ReturnType<typeof getEventSalesBxRecords>;

    constructor() {
        this.api = getEventSalesBxRecords();
    }

    async getRecordsByCompany(
        dto: EvRecordsByCompanyDto,
    ): Promise<EvCallingRecordDto[]> {
        return this.api.bxRecordsGetRecordsByCompany(dto);
    }
}
