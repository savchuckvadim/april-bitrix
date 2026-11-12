import {
    addressMap,
    type AddressDetails,
    type AddressRqItem,
    type AddressTypeId,
} from '../model/types';

export const getAddressDetails = (typeId: AddressTypeId): AddressDetails =>
    addressMap[typeId];

/**
 * Подпись адреса. В конструкторе только юридический и фактический, у физлица
 * тоже (решение владельца 12.11.2026; прежняя подпись «Адрес прописки» для
 * юридического адреса физлица снята).
 */
export const addressTitle = (typeId: AddressTypeId): string => addressMap[typeId].name_type;

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
