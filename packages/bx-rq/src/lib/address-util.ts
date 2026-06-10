import {
    AddressDetails,
    addressMap,
    AddressTypeId,
} from '../type/evs-address-type';
import { AddressRqItem } from '../type/evs-rq-type';

export const getAddressDetails = (type_id: AddressTypeId): AddressDetails => {
    return addressMap[type_id];
};

export const getFullAddressString = (address: AddressRqItem): string => {
    let result = '';
    address.fields.map(f => {
        const value = f.value == 'null' || f.value == null ? '' : f.value;

        const string = value ? `${f.name} : ${value} \n` : '';
        result += string;
    });

    return result;
};
