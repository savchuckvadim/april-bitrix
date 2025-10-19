import { BitrixBaseApi } from '../../../core';
import {
    EBxMethod,
    EBxNamespace,
} from '../../../core/domain/consts/bitrix-api.enum';
import { EBXEntity } from '../../../core/domain/consts/bitrix-entities.enum';
import { IBXActivityConfigurableAddRequest } from '../interfaces/bx-activity-configurable.interface';

export class BxActivityConfigurableRepository {
    constructor(private readonly bitrixService: BitrixBaseApi) {}

    // async get(id: number) {
    //     return this.bitrixService.callType(
    //         EBxNamespace.CRM,
    //         EBXEntity.ACTIVITY,
    //         EBxMethod.GET,
    //         { id },
    //     );
    // }

    // async getBtch(cmdCode: string, activityId: number | string) {
    //     return this.bitrixService.addCmdBatchType(
    //         cmdCode,
    //         EBxNamespace.CRM,
    //         EBXEntity.ACTIVITY,
    //         EBxMethod.GET,
    //         { id: activityId },
    //     );
    // }

    // async getList(
    //     filter: Partial<BXActivityRequestFields>,
    //     select?: string[],
    // ): Promise<
    //     IBitrixResponse<
    //         TBXResponse<EBxNamespace.CRM, EBXEntity.ACTIVITY, EBxMethod.LIST>
    //     >
    // > {
    //     return await this.bitrixService.callType(
    //         EBxNamespace.CRM,
    //         EBXEntity.ACTIVITY,
    //         EBxMethod.LIST,
    //         { select, filter },
    //     );
    // }

    // async getListBtch(
    //     cmdCode: string,
    //     filter: Partial<BXActivityRequestFields>,
    //     select?: string[],
    // ) {
    //     return this.bitrixService.addCmdBatchType(
    //         cmdCode,
    //         EBxNamespace.CRM,
    //         EBXEntity.ACTIVITY,
    //         EBxMethod.LIST,
    //         { select, filter },
    //     );
    // }

    // async getAll(
    //     filter: Partial<BXActivityRequestFields>,
    //     select?: string[],
    // ): Promise<{
    //     activities: IBXActivity[];
    //     total: number;
    // }> {
    //     let condition = true;
    //     const results = [] as IBXActivity[];
    //     let lastId = undefined as undefined | number | string;
    //     while (condition) {
    //         const result = await this.bitrixService.callType(
    //             EBxNamespace.CRM,
    //             EBXEntity.ACTIVITY,
    //             EBxMethod.LIST,
    //             {
    //                 select,
    //                 filter: {
    //                     ...filter,
    //                     '>ID': lastId,
    //                 },
    //                 order: { ID: 'asc' },
    //             },
    //         );
    //         if (result && result.result) {
    //             result.result.map((t: IBXActivity) => {
    //                 lastId = t.id;
    //                 results.push(t);
    //             });
    //         }
    //         if (!result.total) {
    //             condition = false;
    //         }
    //     }
    //     return {
    //         activities: results,
    //         total: results.length,
    //     };
    // }

    // async delete(activityId: number | string) {
    //     return this.bitrixService.callType(
    //         EBxNamespace.CRM,
    //         EBXEntity.ACTIVITY,
    //         EBxMethod.DELETE,
    //         { id: activityId },
    //     );
    // }

    // async deleteBtch(cmdCode: string, activityId: number | string) {
    //     return this.bitrixService.addCmdBatchType(
    //         cmdCode,
    //         EBxNamespace.CRM,
    //         EBXEntity.ACTIVITY,
    //         EBxMethod.DELETE,
    //         { id: activityId },
    //     );
    // }



    async create(dto: IBXActivityConfigurableAddRequest) {
        return this.bitrixService.callType(
            EBxNamespace.CRM,
            EBXEntity.ACTIVITY_CONFIGURABLE,
            EBxMethod.ADD,
            dto,
        );
    }
    async createBtch(cmdCode: string, dto: IBXActivityConfigurableAddRequest) {
        return this.bitrixService.addCmdBatchType(
            cmdCode,
            EBxNamespace.CRM,
            EBXEntity.ACTIVITY_CONFIGURABLE,
            EBxMethod.ADD,
            dto,
        );
    }
    // async update(id: number | string, data: Partial<IBXActivity>) {
    //     return this.bitrixService.callType(
    //         EBxNamespace.CRM,
    //         EBXEntity.ACTIVITY,
    //         EBxMethod.UPDATE,
    //         { id, fields: data },
    //     );
    // }

    // async updateBtch(
    //     cmdCode: string,
    //     id: number | string,
    //     data: Partial<IBXActivity>,
    // ) {
    //     return this.bitrixService.addCmdBatchType(
    //         cmdCode,
    //         EBxNamespace.CRM,
    //         EBXEntity.ACTIVITY,
    //         EBxMethod.UPDATE,
    //         { id, fields: data },
    //     );
    // }
}
