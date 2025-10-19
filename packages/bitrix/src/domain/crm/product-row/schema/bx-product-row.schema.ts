import { EBxMethod } from '../../../../core/domain/consts/bitrix-api.enum';
import {
    IBXProductRow,
    IBXProductRowRow,
} from '../interface/bx-product-row.interface';
import {
    ListProductRowDto,
    ListProductRowResponseDto,
} from '../dto/list-product-row.dto';

export type ProductRowSchema = {
    [EBxMethod.SET]: {
        request: Partial<IBXProductRow>;
        response: { productRows: IBXProductRow[] };
    };
    [EBxMethod.ADD]: {
        request: { fields: Partial<IBXProductRowRow> };
        response: { productRow: IBXProductRowRow };
    };
    [EBxMethod.LIST]: {
        request: { filter: ListProductRowDto; start: -1 };
        response: ListProductRowResponseDto;
    };
};
