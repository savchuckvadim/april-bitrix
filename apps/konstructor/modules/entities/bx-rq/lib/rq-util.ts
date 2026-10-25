import {
    BX_ADDRESS_TYPE,
    RQ_TYPE,
    type AddressRqItem,
    type BankRqItem,
    type ResolvedRQType,
    type RqItem,
    type RqRecord,
} from '../model/types';
import { filterFieldItems } from './field-items-util';

export const getResolvedType = (type: RQ_TYPE): ResolvedRQType =>
    type === RQ_TYPE.BUDGET ? RQ_TYPE.ORGANIZATION : type;

const isFilled = (field: RqItem): boolean =>
    field.value !== null && field.value !== undefined && field.value !== '';

const percentOf = (filled: number, total: number): number =>
    total > 0 ? (filled / total) * 100 : 0;

const round1 = (value: number): number => Number(value.toFixed(1));

const countFields = (groups: Array<{ fields: RqItem[] }>) =>
    groups.reduce(
        (acc, group) => ({
            total: acc.total + group.fields.length,
            filled: acc.filled + group.fields.filter(isFilled).length,
        }),
        { total: 0, filled: 0 },
    );

/** Адреса, которые считаем в заполненности: юридический и фактический. */
const isCountedAddress = (item: AddressRqItem) =>
    item.type_id === BX_ADDRESS_TYPE.PRIMARY ||
    item.type_id === BX_ADDRESS_TYPE.REGISTERED;

export interface RqFillPercent {
    full: number;
    base: number;
    address: number;
    bank: number;
}

export const getRqFillPercent = (
    rq: RqRecord | null,
    clientType: RQ_TYPE,
): RqFillPercent => {
    if (!rq || !rq.fields || rq.fields.length === 0) {
        return { full: 0, base: 0, address: 0, bank: 0 };
    }
    const filtered = filterFieldItems(rq.fields, clientType);
    const baseFill = percentOf(filtered.filter(isFilled).length, filtered.length);
    const addressFill = getAddressFillPercent(rq.address?.items ?? null);
    const bankFill = getBankFillPercent(rq.bank?.items ?? null);
    return {
        full: round1((baseFill + addressFill + bankFill) / 3),
        base: round1(baseFill),
        address: round1(addressFill),
        bank: round1(bankFill),
    };
};

export const getAddressFillPercent = (
    address: AddressRqItem[] | null,
): number => {
    if (!address || address.length === 0) return 0;
    const { total, filled } = countFields(address.filter(isCountedAddress));
    return round1(percentOf(filled, total));
};

export const getBankFillPercent = (banks: BankRqItem[] | null): number => {
    if (!banks || banks.length === 0) return 0;
    const { total, filled } = countFields(banks);
    return round1(percentOf(filled, total));
};
