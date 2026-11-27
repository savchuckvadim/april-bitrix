import {
    PROVIDER_IMAGE_ROLE,
    type ProviderImageRoleMeta,
} from './types';

/** Роли в порядке, в котором слоты идут на экране. */
export const PROVIDER_IMAGE_ROLES: readonly ProviderImageRoleMeta[] = [
    {
        role: PROVIDER_IMAGE_ROLE.STAMP,
        label: 'Печать',
        hint: 'PDF-КП: блок под письмом, рядом с подписью. Печатается при включённой настройке «Печать и подпись».',
    },
    {
        role: PROVIDER_IMAGE_ROLE.SIGNATURE_DIRECTOR,
        label: 'Подпись руководителя',
        hint: 'PDF-КП: блок под письмом, рядом с должностью руководителя. Печатается при включённой настройке «Печать и подпись».',
    },
    {
        role: PROVIDER_IMAGE_ROLE.SIGNATURE_ACCOUNTANT,
        label: 'Подпись главного бухгалтера',
        hint: 'Пока только хранится: в документах появится вместе со счётом в PDF.',
    },
    {
        role: PROVIDER_IMAGE_ROLE.LOGO,
        label: 'Логотип',
        hint: 'PDF-КП: шапка в стилях «Классический» и «Призма», обложка «Призмы». Печатается всегда.',
    },
    {
        role: PROVIDER_IMAGE_ROLE.QR,
        label: 'QR для оплаты',
        hint: 'PDF-счёт: печатается справа от банковской шапки.',
    },
];
