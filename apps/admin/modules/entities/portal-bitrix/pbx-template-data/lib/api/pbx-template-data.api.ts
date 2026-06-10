import { getAdminBitrixFieldsInitDataManagement } from '@workspace/nest-api';
import type { PbxGroupDefinitionDto } from '@workspace/nest-api';

/**
 * API helper for fetching PBX registry template data from the backend.
 * Returns the full list of group definitions (sales, tmc, service, general),
 * each containing smarts, rpas, fields, deal, lead, contact, company, etc.
 */
export class BitrixFieldHelper {
    private api: ReturnType<typeof getAdminBitrixFieldsInitDataManagement>;

    constructor() {
        this.api = getAdminBitrixFieldsInitDataManagement();
    }

    async getAllPbxTemplateData(): Promise<PbxGroupDefinitionDto[]> {
        const response = await this.api.bitrixFieldInitDataGetAllPbxTemplateData();
        return response as PbxGroupDefinitionDto[];
    }
}
