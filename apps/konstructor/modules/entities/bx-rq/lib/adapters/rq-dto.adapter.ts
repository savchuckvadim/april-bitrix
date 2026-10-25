import type {
    RqAddressItemDto,
    RqBankItemDto,
    RqBundleDto,
    RqFieldDto,
    RqRecordDto,
} from '../../model/dto';
import {
    BX_ADDRESS_TYPE,
    CONTRACT_RQ_GROUP,
    RQ_TYPE,
    type AddressRqItem,
    type BankRqItem,
    type RqBankGroup,
    type RqBundle,
    type RqGroup,
    type RqItem,
    type RqRecord,
    type SelectItem,
} from '../../model/types';

/**
 * DTO бэка → домен. Бэк отдаёт поле с `type: string` и `value: unknown`;
 * здесь это сужается до union `RqItem`, чтобы UI и slice не гадали по
 * `as`. Обратное направление (`toFieldDto`) — для store_rq.
 */

const RQ_TYPES = new Set<string>(Object.values(RQ_TYPE));
const GROUPS = new Set<string>(Object.values(CONTRACT_RQ_GROUP));

const toRqType = (value: unknown, fallback: RQ_TYPE): RQ_TYPE =>
    typeof value === 'string' && RQ_TYPES.has(value) ? (value as RQ_TYPE) : fallback;

const toGroup = (value: unknown): CONTRACT_RQ_GROUP | null =>
    typeof value === 'string' && GROUPS.has(value)
        ? (value as CONTRACT_RQ_GROUP)
        : null;

const isSelectItem = (value: unknown): value is SelectItem =>
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'code' in value &&
    'name' in value;

const toStringValue = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    return '';
};

export const fromFieldDto = (dto: RqFieldDto): RqItem => {
    const base = {
        name: dto.name,
        isRequired: dto.isRequired,
        code: dto.code,
        includes: (dto.includes ?? [])
            .map(code => toRqType(code, RQ_TYPE.ORGANIZATION))
            .filter((code, index, all) => all.indexOf(code) === index),
        group: toGroup(dto.group),
        isActive: dto.isActive ?? true,
        isDisable: dto.isDisable ?? false,
        order: dto.order ?? 0,
    };
    switch (dto.type) {
        case 'select':
            return {
                ...base,
                type: 'select',
                items: Array.isArray(dto.value)
                    ? dto.value.filter(isSelectItem)
                    : [],
                value: isSelectItem(dto.value) ? dto.value : null,
            };
        case 'file':
            return {
                ...base,
                type: 'file',
                file: undefined,
                value: toStringValue(dto.value),
            };
        case 'text':
        case 'date':
            return { ...base, type: dto.type, value: toStringValue(dto.value) };
        default:
            return { ...base, type: 'string', value: toStringValue(dto.value) };
    }
};

const INCLUDES_BY_TYPE: Record<RQ_TYPE, RqFieldDto['includes'][number]> = {
    [RQ_TYPE.ORGANIZATION]: 'org',
    [RQ_TYPE.BUDGET]: 'org',
    [RQ_TYPE.IP]: 'ip',
    [RQ_TYPE.FIZ]: 'fiz',
};

/** Домен → поле запроса: значение селекта уходит кодом, файл — строкой. */
export const toFieldDto = (field: RqItem): RqFieldDto => ({
    type: field.type,
    name: field.name,
    code: field.code,
    isRequired: field.isRequired,
    includes: field.includes
        .map(type => INCLUDES_BY_TYPE[type])
        .filter((code, index, all) => all.indexOf(code) === index),
    group: field.group ?? undefined,
    isActive: field.isActive,
    isDisable: field.isDisable,
    order: field.order,
    value:
        field.type === 'select'
            ? (field.value?.code ?? null)
            : typeof field.value === 'string'
              ? field.value
              : field.value.downloadUrl,
});

const toAddressType = (value: number): BX_ADDRESS_TYPE =>
    value === BX_ADDRESS_TYPE.REGISTERED || value === BX_ADDRESS_TYPE.REGISTERED_FIZ
        ? value
        : BX_ADDRESS_TYPE.PRIMARY;

export const fromAddressItemDto = (dto: RqAddressItemDto): AddressRqItem => ({
    anchor_id: dto.anchor_id,
    type_id: toAddressType(dto.type_id),
    name_type: dto.name_type,
    fields: dto.fields.map(fromFieldDto),
});

export const toAddressItemDto = (item: AddressRqItem): RqAddressItemDto => ({
    anchor_id: item.anchor_id,
    type_id: item.type_id,
    name_type: item.name_type,
    fields: item.fields.map(toFieldDto),
});

export const fromBankItemDto = (dto: RqBankItemDto): BankRqItem => ({
    id: dto.id,
    fields: dto.fields.map(fromFieldDto),
});

export const toBankItemDto = (item: BankRqItem): RqBankItemDto => ({
    id: item.id,
    fields: item.fields.map(toFieldDto),
});

const fromBankDto = (dto: RqRecordDto['bank']): RqBankGroup => {
    const items = (dto?.items ?? []).map(fromBankItemDto);
    const current = dto?.current ? fromBankItemDto(dto.current) : (items[0] ?? null);
    return { items, current, fields: current?.fields ?? [] };
};

export const fromRecordDto = (dto: RqRecordDto, fallbackType: RQ_TYPE): RqRecord => {
    const addressItems = (dto.address?.items ?? []).map(fromAddressItemDto);
    return {
        bx_id: dto.bx_id ?? -1,
        preset_id: dto.preset_id ?? 1,
        fields: dto.fields.map(fromFieldDto),
        address: {
            items: addressItems,
            current: dto.address?.current
                ? fromAddressItemDto(dto.address.current)
                : (addressItems[0] ?? null),
        },
        bank: fromBankDto(dto.bank),
        type: toRqType(dto.type, fallbackType),
    };
};

export const toRecordDto = (record: RqRecord): RqRecordDto => ({
    bx_id: record.bx_id,
    preset_id: record.preset_id,
    type: record.type,
    fields: record.fields.map(toFieldDto),
    address: {
        items: record.address.items.map(toAddressItemDto),
        current: record.address.current
            ? toAddressItemDto(record.address.current)
            : undefined,
    },
    bank: {
        items: record.bank.items.map(toBankItemDto),
        current: record.bank.current ? toBankItemDto(record.bank.current) : undefined,
    },
});

const EMPTY_RECORD = (type: RQ_TYPE): RqRecord => ({
    bx_id: -1,
    preset_id: 1,
    fields: [],
    address: { items: [], current: null },
    bank: { items: [], current: null, fields: [] },
    type,
});

const fromGroupDto = (dto: RqBundleDto['org'], type: RQ_TYPE): RqGroup => ({
    items: (dto?.items ?? []).map(item => fromRecordDto(item, type)),
    default: dto?.default ? fromRecordDto(dto.default, type) : EMPTY_RECORD(type),
});

export const fromBundleDto = (dto: RqBundleDto): RqBundle => ({
    [RQ_TYPE.ORGANIZATION]: fromGroupDto(dto.org, RQ_TYPE.ORGANIZATION),
    [RQ_TYPE.IP]: fromGroupDto(dto.ip, RQ_TYPE.IP),
    [RQ_TYPE.FIZ]: fromGroupDto(dto.fiz, RQ_TYPE.FIZ),
    current: dto.current ? fromRecordDto(dto.current, RQ_TYPE.ORGANIZATION) : null,
});
