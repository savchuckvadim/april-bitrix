// Типы картинок реквизитов поставщика. Описаны руками: ручки
// `/api/admin/portal/provider/rq/:rqId/images` ещё не попали в orval.
// После `pnpm run generate` интерфейс `ProviderImage` заменяется алиасом на
// сгенерированный DTO, а роли и формат сверяются с его перечислениями:
// правка ограничится этим файлом и helper'ом.

/** Роли картинок реквизитов поставщика (значения совпадают с бэком). */
export const PROVIDER_IMAGE_ROLE = {
    STAMP: 'stamp',
    SIGNATURE_DIRECTOR: 'signature_director',
    SIGNATURE_ACCOUNTANT: 'signature_accountant',
    LOGO: 'logo',
    QR: 'qr',
} as const;

export type ProviderImageRole =
    (typeof PROVIDER_IMAGE_ROLE)[keyof typeof PROVIDER_IMAGE_ROLE];

/** Формат файла, как его называет бэк. */
export type ProviderImageFormat = 'png' | 'jpg';

/** Картинка реквизитов: метаданные, сам файл берётся отдельным запросом. */
export interface ProviderImage {
    /** uuid; при замене файла меняется */
    id: string;
    /** id реквизитов (`RqEntity.id` из списка поставщиков) */
    rqId: number;
    role: ProviderImageRole;
    format: ProviderImageFormat;
    /** Размеры в пикселях */
    width: number;
    height: number;
    /** Вес файла в байтах */
    size: number;
    originalName: string | null;
    createdAt: string | null;
    updatedAt: string | null;
}

/** Описание роли для экрана: подпись и где картинка печатается. */
export interface ProviderImageRoleMeta {
    role: ProviderImageRole;
    label: string;
    /** Где картинка попадает в документы */
    hint: string;
}

/** Слот экрана: роль и загруженная в неё картинка (null, если не загружена). */
export interface ProviderImageSlot extends ProviderImageRoleMeta {
    image: ProviderImage | null;
}
