import { EBxMethod } from '../../../../core/domain/consts/bitrix-api.enum';
import {
    CrmItemAddRequestType,
    CrmItemGetRequestType,
    CrmItemListRequestType,
    CrmUpdateItemRequestType,
} from '../../type/crm-request.type';

import { IBXItem } from '../interface/item.interface';
import {
    BxItemListResponseDto,
    BxItemResponseDto,
} from '../dto/item-response.dto';

export type BxItemSchema = {
    [EBxMethod.UPDATE]: {
        request: CrmUpdateItemRequestType<IBXItem>;
        response: BxItemResponseDto;
    };

    [EBxMethod.LIST]: {
        request: CrmItemListRequestType<IBXItem['entityTypeId']>;
        response: BxItemListResponseDto;
    };

    [EBxMethod.GET]: {
        request: CrmItemGetRequestType<string | number>;
        response: BxItemResponseDto;
    };

    [EBxMethod.ADD]: {
        request: CrmItemAddRequestType<IBXItem, string>;
        response: BxItemResponseDto;
    };

    [EBxMethod.DELETE]: {
        request: CrmItemGetRequestType<string | number>;
        response: boolean;
    };
};
