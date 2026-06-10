import { EvsRqItem, ResolvedRQType } from '../type/evs-rq-type';
import {
    CONTRACT_LTYPE,
    CONTRACT_RQ_GROUP,
    RQ_ITEM_CODE,
    RQ_TYPE,
    RQ_TYPE_NAME,
    RqItem,
    SupplyTypesType,
} from '../type/input-type';
import { getResolvedType } from './rq-util';

export const filterFieldItems = (
    items: RqItem[],
    currentClientType: RQ_TYPE | undefined | null,
    // contractType?: CONTRACT_LTYPE,
    // supplyType?: SupplyTypesType
): RqItem[] => {
    let clientType = currentClientType || (RQ_TYPE.ORGANIZATION as RQ_TYPE);

    if (clientType == RQ_TYPE.BUDGET) {
        clientType = RQ_TYPE.ORGANIZATION;
    }

    const result = items
        .filter((rqItem: RqItem) => {
            if (clientType) {
                return (
                    rqItem.isActive &&
                    (rqItem.includes.includes(clientType) ||
                        rqItem.code === 'inn')
                );
            }
            return rqItem.isActive;
        })
        .filter((rqItem: RqItem) => {
            if (rqItem.type !== 'select') {
                if (rqItem.contractType && rqItem.supplies) {
                    return rqItem.isActive;
                    //  &&
                    // rqItem.contractType.includes(contractType) &&
                    // rqItem.supplies.includes(supplyType)
                }
            }
            return rqItem.isActive;
        })
        .sort((a: RqItem, b: RqItem) => a.order - b.order)
        .map((rqItem: RqItem) => {
            const group = CONTRACT_RQ_GROUP.RQ;

            return {
                ...rqItem,
                group: group,
            };
        });

    return result;
};

export const getClinetTypeNameByCode = (type: RQ_TYPE | null): RQ_TYPE_NAME => {
    if (!type) {
        return RQ_TYPE_NAME.ORGANIZATION;
    }
    switch (type) {
        case RQ_TYPE.ORGANIZATION:
            return RQ_TYPE_NAME.ORGANIZATION;
        case RQ_TYPE.BUDGET:
            return RQ_TYPE_NAME.BUDGET;
        case RQ_TYPE.IP:
            return RQ_TYPE_NAME.IP;
        case RQ_TYPE.FIZ:
            return RQ_TYPE_NAME.FIZ;
        default:
            return RQ_TYPE_NAME.ORGANIZATION;
    }
};

export const isFieldsEmpty = (fields: RqItem[]): boolean => {
    let result = true;
    fields.map(f => {
        if (f.value) {
            result = false;
        }
    });

    return result;
};

export const getFullName = (
    fields: RqItem[],
): { fullName: string; initials: string } => {
    let fullName = '';
    let lastName = '';
    let initials = '';

    fields.forEach(field => {
        if (field.type === 'string') {
            if (field.code === 'last_name') {
                lastName = field.value;
            }
            if (field.code === 'first_name' || field.code === 'second_name') {
                initials += field.value.charAt(0).toUpperCase() + '.';
            }
            if (
                field.code === 'first_name' ||
                field.code === 'last_name' ||
                field.code === 'second_name'
            ) {
                fullName += field.value + ' ';
            }
        }
    });

    // Убираем лишние пробелы
    fullName = fullName.trim();

    return {
        fullName,
        initials: `${lastName} ${initials}`.trim(),
    };
};

export const validatePushRq = (
    currentClientType: RQ_TYPE,
    rq: EvsRqItem,
    document: 'contract' | 'supply',
): string[] => {
    let result = [] as string[];
    const baseFields = rq.fields;
    const address = rq.address.items;
    const bankFields = rq.bank.current.fields;
    const resolvedType = getResolvedType(currentClientType) as ResolvedRQType;

    const baseCodes = [
        'inn',
        // 'kpp',
        'fullname',
        'shortname',
        'director',
        'position',
        'phone',
        'document',
        'docSer',
        'docNum',
        'personName',
    ];
    const addressCodes = [
        'address_country',
        'address_city',
        'address_1',
        'address_postal_code',
    ];

    const bankCodes = [
        'bank_name',
        'bank_address',
        'bank_bik',
        'bank_pc',
        'bank_kc',
    ];
    //supply

    baseFields.forEach(field => {
        if (field.includes.includes(resolvedType)) {
            if (baseCodes.includes(field.code)) {
                if (!field.value) {
                    result.push(field.name);
                }
            }
        }
    });
    address.forEach(ad => {
        ad.fields.forEach(field => {
            if (addressCodes.includes(field.code)) {
                if (!field.value) {
                    result.push(field.name);
                }
            }
        });
    });
    bankFields.forEach(field => {
        if (bankCodes.includes(field.code)) {
            if (!field.value) {
                result.push(field.name);
            }
        }
    });

    return result;
};

export const getFieldValuByCode = (
    fields: RqItem[],
    code: string,
): string | null => {
    const field = fields.find(f => f.code === code);
    return field?.value as string | null;
};

export const getRqShowName = (
    fields: RqItem[],
    clientType: RQ_TYPE,
    limit?: number,
): string => {
    let fieldValueByCode = 'Реквизиты';

    if (clientType === RQ_TYPE.FIZ) {
        const code = RQ_ITEM_CODE.PERSON_NAME;
        const shortName = getFieldValuByCode(fields, code);
        if (shortName) {
            fieldValueByCode = shortName;
        } else {
            const code = RQ_ITEM_CODE.LAST_NAME;
            const fullName = getFieldValuByCode(fields, code);
            if (fullName) {
                fieldValueByCode = fullName;
            }
        }
    } else {
        let code = RQ_ITEM_CODE.SHORTNAME;
        const shortName = getFieldValuByCode(fields, code);
        if (shortName) {
            fieldValueByCode = shortName;
        } else {
            const code = RQ_ITEM_CODE.FULLNAME;
            const fullName = getFieldValuByCode(fields, code);
            if (fullName) {
                fieldValueByCode = fullName;
            }
        }
    }
    if (limit) {
        if (fieldValueByCode.length > limit) {
            return fieldValueByCode.slice(0, limit) + '...';
        }
    }
    return fieldValueByCode;
};
