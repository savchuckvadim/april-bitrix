import type { AddressRqItem, BankRqItem, RqItem, RqRecord } from '../../bx-rq/model/types';
import type { ContractBxRq } from '../model/dto';

type BxRqField = ContractBxRq['fields'][number];
type BxRqAddressField = ContractBxRq['address']['items'][number]['fields'][number];
type BxRqBankField = ContractBxRq['bank']['current']['fields'][number];

/**
 * Поле реквизита → форма BxRqDto. Коды и перечисления те же, что отдаёт
 * rq-lib (один бэк), поэтому сужение типов — утверждение, не преобразование.
 */
const toField = <T extends BxRqField | BxRqAddressField | BxRqBankField>(
    field: RqItem,
    group: T['group'],
): T =>
    ({
        type: field.type,
        name: field.name,
        value: field.value ?? null,
        code: field.code,
        isRequired: field.isRequired,
        includes: field.includes,
        group: field.group ?? group,
        isActive: field.isActive,
        isDisable: field.isDisable,
        order: field.order,
        isHidden: field.isHidden,
    }) as unknown as T;

const toAddress = (item: AddressRqItem): ContractBxRq['address']['items'][number] => ({
    anchor_id: item.anchor_id,
    type_id: item.type_id,
    name_type: item.name_type,
    fields: item.fields.map(field => toField<BxRqAddressField>(field, 'address')),
});

const toBank = (item: BankRqItem): ContractBxRq['bank']['current'] => ({
    id: item.id,
    fields: item.fields.map(field => toField<BxRqBankField>(field, 'bank')),
});

/**
 * Реквизит клиента для договора: текущий реквизит bx-rq → BxRqDto бэка.
 * Банка может не быть — бэк ждёт объект, отдаём пустой (id 0).
 */
export const toContractBxRq = (record: RqRecord): ContractBxRq => ({
    preset_id: record.preset_id,
    fields: record.fields.map(field => toField<BxRqField>(field, 'rq')),
    address: { items: record.address.items.map(toAddress) },
    bank: {
        current: record.bank.current ? toBank(record.bank.current) : { id: 0, fields: [] },
        items: record.bank.items.map(toBank),
    },
});
