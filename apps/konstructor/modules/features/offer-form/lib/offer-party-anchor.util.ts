/**
 * Якоря карточек «Кому» и «От кого и счёт» наверху экрана КП: по ним строки
 * сводки в «Сборке» прокручивают экран к нужной карточке.
 */
export const OFFER_PARTY_ANCHOR = {
    recipient: 'offer-party-recipient',
    sender: 'offer-party-sender',
} as const;

export type OfferPartyAnchor = keyof typeof OFFER_PARTY_ANCHOR;

/** Прокрутить экран к карточке; нет карточки на странице — ничего не делаем. */
export const scrollToOfferParty = (anchor: OfferPartyAnchor): void => {
    const card = document.getElementById(OFFER_PARTY_ANCHOR[anchor]);
    if (!card) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    card.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
};
