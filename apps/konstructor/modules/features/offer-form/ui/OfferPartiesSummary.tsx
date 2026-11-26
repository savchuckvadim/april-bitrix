'use client';

import { useOfferPartiesSummary } from '../hooks/use-offer-parties-summary';
import { OfferPartyRow } from './OfferPartyRow';

/**
 * Короткая сводка в «Сборке», над кнопкой формирования: кому адресовано КП,
 * от какого поставщика и нужен ли счёт. Строка ведёт к своей карточке наверху.
 */
export const OfferPartiesSummary = () => {
    const summary = useOfferPartiesSummary();

    return (
        <ul aria-label="Кому, от кого и счёт" className="flex flex-col gap-0.5 border-t pt-3">
            {summary.facts.map(fact => (
                <OfferPartyRow key={fact.id} fact={fact} onSelect={summary.goTo} />
            ))}
        </ul>
    );
};
