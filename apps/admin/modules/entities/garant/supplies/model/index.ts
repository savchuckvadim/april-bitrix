export type {
    GetSupplyResponseDto,
    CreateSupplyDto,

    SupplyDto,
    SupplyDtoContractPropSuppliesQuantity,
} from '@workspace/nest-admin-api';

export {
    SUPPLY_FIELDS,
    SUPPLY_FIELD_GROUPS,
    SUPPLY_TABLE_PRIMARY_KEYS,
    SUPPLY_TEMPLATE_HINTS,
    SUPPLY_TEXT_KEYS,
    countFilledTexts,
} from './supply-fields';
export type {
    SupplyFieldGroup,
    SupplyFieldInfo,
    SupplyFieldKey,
    SupplyFieldKind,
} from './supply-fields';
