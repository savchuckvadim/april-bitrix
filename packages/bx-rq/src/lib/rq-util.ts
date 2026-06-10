import { BX_ADDRESS_TYPE } from '../type/evs-address-type';
import {
    AddressRqItem,
    BankRqItem,
    EvsRqItem,
    ResolvedRQType,
} from '../type/evs-rq-type';
import { RQ_TYPE } from '../type/input-type';
import { filterFieldItems } from './field-items-util';

export const getResolvedType = (type: RQ_TYPE): ResolvedRQType => {
    return type === RQ_TYPE.BUDGET ? RQ_TYPE.ORGANIZATION : type;
};

export interface RqFillPercent {
    full: number;
    base: number;
    address: number;
    bank: number;
}
export const getRqFillPercent = (
    rq: EvsRqItem | null,
    clientType: RQ_TYPE,
): RqFillPercent => {
    let result = 0;
    let baseFill = 0;
    let addressFill = 0;
    let bankFill = 0;
    if (rq && rq.fields && rq.fields.length > 0) {
        const filtredFields = filterFieldItems(rq.fields, clientType);
        const filledFields = filtredFields.filter(
            field =>
                field.value !== null &&
                field.value !== undefined &&
                field.value !== '',
        );
        baseFill = (filledFields.length / filtredFields.length) * 100;

        if (rq.address && rq.address.items && rq.address.items.length > 0) {
            let fieldsCount = 0;
            let filledFieldsCount = 0;
            rq.address.items.forEach(item => {
                const fields = item.fields;

                if (
                    item.type_id === BX_ADDRESS_TYPE.PRIMARY ||
                    item.type_id === BX_ADDRESS_TYPE.REGISTERED
                ) {
                    fieldsCount += fields.length;
                    const filledFields = fields.filter(
                        field =>
                            field.value !== null &&
                            field.value !== undefined &&
                            field.value !== '',
                    );
                    filledFieldsCount += filledFields.length;
                }
            });
            addressFill = (filledFieldsCount / fieldsCount) * 100;
        }

        if (rq.bank && rq.bank.items && rq.bank.items.length > 0) {
            let fieldsCount = 0;
            let filledFieldsCount = 0;
            rq.bank.items.forEach(item => {
                const fields = item.fields;
                fieldsCount += fields.length;
                const filledFields = fields.filter(
                    field =>
                        field.value !== null &&
                        field.value !== undefined &&
                        field.value !== '',
                );
                filledFieldsCount += filledFields.length;
            });
            bankFill = (filledFieldsCount / fieldsCount) * 100;
        }

        result = (baseFill + addressFill + bankFill) / 3;
    }
    return {
        full: Number(result.toFixed(1)),
        base: Number(baseFill.toFixed(1)),
        address: Number(addressFill.toFixed(1)),
        bank: Number(bankFill.toFixed(1)),
    };
};

export const getAddressFillPercent = (
    address: AddressRqItem[] | null,
): number => {
    if (!address || address.length === 0) return 0;
    let addressFill = 0;
    let fieldsCount = 0;
    let filledFieldsCount = 0;

    address.forEach(item => {
        const fields = item.fields;

        if (
            item.type_id === BX_ADDRESS_TYPE.PRIMARY ||
            item.type_id === BX_ADDRESS_TYPE.REGISTERED
        ) {
            fieldsCount += fields.length;
            const filledFields = fields.filter(
                field =>
                    field.value !== null &&
                    field.value !== undefined &&
                    field.value !== '',
            );
            filledFieldsCount += filledFields.length;
        }
    });

    addressFill = (filledFieldsCount / fieldsCount) * 100;
    return Number(addressFill.toFixed(1));
};

export const getBankFillPercent = (banks: BankRqItem[] | null): number => {
    if (!banks || banks.length === 0) return 0;
    let bankFill = 0;

    if (banks && banks.length > 0) {
        let fieldsCount = 0;
        let filledFieldsCount = 0;
        banks.forEach(item => {
            const fields = item.fields;
            fieldsCount += fields.length;
            const filledFields = fields.filter(
                field =>
                    field.value !== null &&
                    field.value !== undefined &&
                    field.value !== '',
            );
            filledFieldsCount += filledFields.length;
        });
        bankFill = (filledFieldsCount / fieldsCount) * 100;
    }
    return Number(bankFill.toFixed(1));
};
