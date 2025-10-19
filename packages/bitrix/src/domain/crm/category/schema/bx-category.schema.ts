import { EBxMethod } from '../../../../core';
import { IBXCategory } from '../interface/bx-category.interface';
import { BitrixOwnerTypeId } from '../../../../domain/enums/bitrix-constants.enum';

export type BxCategorySchema = {
    [EBxMethod.LIST]: {
        request: { entityTypeId: BitrixOwnerTypeId | string };
        response: { categories: IBXCategory[] };
    };
    [EBxMethod.GET]: {
        request: {
            id: number | string;
            entityTypeId: BitrixOwnerTypeId | string;
        };
        response: { category: IBXCategory };
    };
};
