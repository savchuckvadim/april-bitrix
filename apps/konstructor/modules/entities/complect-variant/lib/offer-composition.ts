import { COMPLECT_MODE, type ComplectComposition } from '../model/dto';

/**
 * Настройки сделки в том виде, в каком они уходят в КП. КП делают по одному
 * варианту, поэтому режим сделки на него не влияет: в запрос идёт режим
 * `compare` при любом выбранном. Запрос КП и ключ превью от смены режима не
 * меняются.
 */
export const toOfferComposition = (composition: ComplectComposition): ComplectComposition => ({
    ...composition,
    mode: COMPLECT_MODE.compare,
});

/** Равенство по полям, без учёта порядка ключей. */
const hasSameEntries = (left: object, right: object): boolean => {
    const rightEntries = new Map(Object.entries(right));
    const leftEntries = Object.entries(left);
    return (
        leftEntries.length === rightEntries.size &&
        leftEntries.every(([key, value]) => rightEntries.get(key) === value)
    );
};

/** Две настройки сделки дают одно и то же в КП: отличаться они могут только режимом. */
export const isSameOfferComposition = (left: ComplectComposition, right: ComplectComposition): boolean =>
    (left.openVariantSmartId ?? null) === (right.openVariantSmartId ?? null) &&
    hasSameEntries(left.offer, right.offer);
