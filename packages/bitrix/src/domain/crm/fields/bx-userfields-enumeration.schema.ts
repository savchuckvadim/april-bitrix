import { EBxMethod } from '../../../core/domain/consts/bitrix-api.enum';
import { IBXUserEnumerationField } from '../../interfaces/bitrix.interface';

export type FieldsEnumerationSchema = {
    [EBxMethod.FIELDS]: {
        request: undefined;
        response: { fields: IBXUserEnumerationField[] };
    };
};
