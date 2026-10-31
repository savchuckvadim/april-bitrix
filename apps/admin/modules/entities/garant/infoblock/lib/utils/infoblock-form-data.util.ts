import type { InfoblockCreateDto, InfoblockDetail } from '../../model';

/**
 * Инфоблок → данные формы правки. Форма отправляет всё, что лежит в начальных
 * данных, поэтому сюда идут и поля без своего инпута (title, tag): пропущенное
 * поле не должно менять значение в БД при сохранении. Связи (packages,
 * packageInfoblocks) правятся отдельно в InfoblockRelationsManager.
 */
export const toInfoblockFormData = (infoblock: InfoblockDetail): InfoblockCreateDto => ({
    number: infoblock.number,
    name: infoblock.name,
    title: infoblock.title ?? null,
    description: infoblock.description ?? null,
    descriptionForSale: infoblock.descriptionForSale ?? null,
    shortDescription: infoblock.shortDescription ?? null,
    code: infoblock.code,
    weight: infoblock.weight,
    group_id: infoblock.group_id?.toString() || infoblock.group?.id || '',
    isLa: infoblock.isLa,
    isFree: infoblock.isFree,
    isShowing: infoblock.isShowing,
    isSet: infoblock.isSet,
    isProduct: infoblock.isProduct ?? null,
    isPackage: infoblock.isPackage ?? null,
    tag: infoblock.tag ?? null,
});
