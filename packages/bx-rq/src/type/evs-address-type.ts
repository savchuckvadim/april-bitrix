export enum BX_ADDRESS_TYPE {
    PRIMARY = 1,
    REGISTERED = 6,
    REGISTERED_FIZ = 4,
}
export const addressMap = {
    [BX_ADDRESS_TYPE.PRIMARY]: { name_type: 'Фактический адрес', code: 'fact' },
    [BX_ADDRESS_TYPE.REGISTERED]: {
        name_type: 'Юридический адрес',
        code: 'registred',
    },
    [BX_ADDRESS_TYPE.REGISTERED_FIZ]: {
        name_type: 'Адрес прописки',
        code: 'registred_fiz',
    },
} as const;

// Тип для ключей (type_id)
export type AddressTypeId = keyof typeof addressMap;

// Тип для значений
export type AddressDetails = (typeof addressMap)[AddressTypeId];
