import {
    PROVIDER_IMAGE_ROLES,
    type ProviderImage,
    type ProviderImageSlot,
} from '../model';

/**
 * Четыре слота по ролям в порядке экрана. В слот попадает картинка своей
 * роли; если бэк прислал несколько картинок одной роли, берётся последняя
 * по порядку списка.
 */
export function buildProviderImageSlots(
    images: readonly ProviderImage[] | undefined,
): ProviderImageSlot[] {
    return PROVIDER_IMAGE_ROLES.map((meta) => {
        const ofRole = images?.filter((item) => item.role === meta.role) ?? [];
        return { ...meta, image: ofRole[ofRole.length - 1] ?? null };
    });
}

/** В списке нет ни одной картинки. */
export function hasNoProviderImages(slots: readonly ProviderImageSlot[]): boolean {
    return slots.every((slot) => slot.image === null);
}
