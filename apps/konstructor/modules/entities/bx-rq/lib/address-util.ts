import {
    addressMap,
    BX_ADDRESS_TYPE,
    RQ_TYPE,
    type AddressDetails,
    type AddressRqItem,
    type AddressTypeId,
} from '../model/types';

export const getAddressDetails = (typeId: AddressTypeId): AddressDetails =>
    addressMap[typeId];

/**
 * Подпись адреса. В конструкторе только юридический и фактический
 * (договорённость с владельцем): у физлица юридический — это адрес прописки,
 * фактический — место оказания услуг в части договоров.
 */
export const addressTitle = (
    typeId: AddressTypeId,
    clientType: RQ_TYPE | null | undefined,
): string =>
    typeId === BX_ADDRESS_TYPE.REGISTERED && clientType === RQ_TYPE.FIZ
        ? 'Адрес прописки'
        : addressMap[typeId].name_type;

export const getFullAddressString = (address: AddressRqItem): string =>
    address.fields
        .map(field => {
            const value =
                field.type === 'select'
                    ? field.value?.name
                    : field.value === 'null'
                      ? ''
                      : field.value;
            return value && typeof value === 'string'
                ? `${field.name} : ${value} \n`
                : '';
        })
        .join('');
