import { BitrixBaseApi } from '../../../../core';
import { EBXEntity } from '../../../../core/domain/consts/bitrix-entities.enum';
import {
    EBxMethod,
    EBxNamespace,
} from '../../../../core/domain/consts/bitrix-api.enum';
import { IBXTimelineComment } from '../interface/bx-timeline.interface';

export class BxTimelineRepository {
    constructor(private readonly bxApi: BitrixBaseApi) {}
    async addTimelineComment(data: IBXTimelineComment) {
        return await this.bxApi.callType(
            EBxNamespace.CRM,
            EBXEntity.TIMELINE_COMMENT,
            EBxMethod.ADD,
            { fields: data },
        );
    }
    addTimelineCommentBtch(cmd: string, data: IBXTimelineComment) {
        return this.bxApi.addCmdBatchType(
            cmd,
            EBxNamespace.CRM,
            EBXEntity.TIMELINE_COMMENT,
            EBxMethod.ADD,
            { fields: data },
        );
    }
}
