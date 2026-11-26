'use client';

import { OFFER_PARTY_ANCHOR } from '../lib/offer-party-anchor.util';
import { InvoiceOptions } from './InvoiceOptions';
import { RecipientFields } from './RecipientFields';

/**
 * Блок «Кому» и «От кого и счёт» наверху экрана КП: две карточки рядом на
 * широком экране, одна под другой на узком. У каждой свой якорь — к нему
 * прокручивает клик по строке сводки в «Сборке».
 */
export const OfferParties = () => (
    <div className="grid gap-4 xl:grid-cols-2">
        <div id={OFFER_PARTY_ANCHOR.recipient} className="grid scroll-mt-20">
            <RecipientFields />
        </div>
        <div id={OFFER_PARTY_ANCHOR.sender} className="grid scroll-mt-20">
            <InvoiceOptions />
        </div>
    </div>
);
