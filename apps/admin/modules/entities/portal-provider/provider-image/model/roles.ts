import {
    PROVIDER_IMAGE_ROLE,
    type ProviderImageRoleMeta,
} from './types';

/** Роли в порядке, в котором слоты идут на экране. */
export const PROVIDER_IMAGE_ROLES: readonly ProviderImageRoleMeta[] = [
    {
        role: PROVIDER_IMAGE_ROLE.STAMP,
        label: 'Печать',
        hint: 'Печатается в блоке под письмом КП рядом с подписью.',
    },
    {
        role: PROVIDER_IMAGE_ROLE.SIGNATURE_DIRECTOR,
        label: 'Подпись руководителя',
        hint: 'Печатается в блоке под письмом КП рядом с должностью руководителя.',
    },
    {
        role: PROVIDER_IMAGE_ROLE.SIGNATURE_ACCOUNTANT,
        label: 'Подпись главного бухгалтера',
        hint: 'Печатается в документах, где нужна подпись главного бухгалтера.',
    },
    {
        role: PROVIDER_IMAGE_ROLE.LOGO,
        label: 'Логотип',
        hint: 'Печатается в шапке документов поставщика.',
    },
];
