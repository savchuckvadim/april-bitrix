import { EBxMethod } from '../../../../core/domain/consts/bitrix-api.enum';
import { CrmAddRequestType } from '../../type/crm-request.type';
import { IBXTimelineComment } from '../interface/bx-timeline.interface';

export type TimelineCommentSchema = {
    [EBxMethod.ADD]: {
        request: CrmAddRequestType<IBXTimelineComment>;
        response: { result: number };
    };
};
