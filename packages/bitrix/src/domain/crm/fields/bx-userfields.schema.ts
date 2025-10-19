import { EBxMethod } from '../../../core/domain/consts/bitrix-api.enum';
import { IBXUserField } from '../../interfaces/bitrix.interface';

export type FieldsSchema = {
    [EBxMethod.FIELDS]: {
        request: undefined;
        response: { fields: IBXUserField[] };
    };
};
