import {
    addressMap,
    type AddressDetails,
    type AddressRqItem,
    type AddressTypeId,
} from '../model/types';

export const getAddressDetails = (typeId: AddressTypeId): AddressDetails =>
    addressMap[typeId];

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
