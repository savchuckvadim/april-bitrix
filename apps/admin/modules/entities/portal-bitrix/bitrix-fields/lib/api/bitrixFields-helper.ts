import { getAdminBitrixFieldsManagement } from '@workspace/nest-api';
import {
    PbxCreateFieldDto,
    PbxCreateFieldsBulkDto,
    PbxField,
    PbxGetFieldsByEntityDto,
    PbxUpdateFieldDto,
} from '../../model';

export class BitrixFieldHelper {
    private api: ReturnType<typeof getAdminBitrixFieldsManagement>;
    constructor() {
        this.api = getAdminBitrixFieldsManagement();
    }

    async getBitrixFields(dto: PbxGetFieldsByEntityDto) {
        const response = await this.api.bitrixFieldGetFieldsByEntity(dto) as PbxField[];
        return response;
    }

    async createBitrixField(dto: PbxCreateFieldDto) {
        const response = await this.api.bitrixFieldCreateField(dto);
        return response;
    }
    async createBitrixFieldsBulk(dto: PbxCreateFieldsBulkDto) {
        const response = await this.api.bitrixFieldCreateFieldsBulk(dto);
        return response;
    }

    async updateBitrixField(id: number, dto: PbxUpdateFieldDto) {
        const response = await this.api.bitrixFieldUpdateField(id, dto);
        return response;
    }

    async deleteBitrixField(id: number) {
        const response = await this.api.bitrixFieldDeleteField(id);
        return response;
    }

    async getBitrixFieldById(id: number) {
        const response = await this.api.bitrixFieldGetFieldById(id);
        return response;
    }

}
