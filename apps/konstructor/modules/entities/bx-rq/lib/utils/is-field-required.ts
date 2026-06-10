import { RqItem } from '@workspace/bx-rq';
import {
    E_REQUIRED_DOCUMENT_ADDRESS_RQ_ITEM_CODE,
    E_REQUIRED_DOCUMENT_BANK_RQ_ITEM_CODE,
    E_REQUIRED_DOCUMENT_RQ_ITEM_CODE,
} from '../../type/required-fields.type';

export const isFieldRequired = (field: RqItem) => {
    if (
        Object.values(E_REQUIRED_DOCUMENT_RQ_ITEM_CODE).includes(
            field.code as E_REQUIRED_DOCUMENT_RQ_ITEM_CODE,
        )
    ) {
        return true;
    } else if (
        Object.values(E_REQUIRED_DOCUMENT_ADDRESS_RQ_ITEM_CODE).includes(
            field.code as E_REQUIRED_DOCUMENT_ADDRESS_RQ_ITEM_CODE,
        )
    ) {
        return true;
    } else if (
        Object.values(E_REQUIRED_DOCUMENT_BANK_RQ_ITEM_CODE).includes(
            field.code as E_REQUIRED_DOCUMENT_BANK_RQ_ITEM_CODE,
        )
    ) {
        return true;
    }
    return false;
};
