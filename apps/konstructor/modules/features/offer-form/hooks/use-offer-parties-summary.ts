'use client';

import { useMemo } from 'react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { selectOfferRecipient, selectOfferRequestInvoice } from '@/modules/entities/offer-document';
import { useProviderChoice } from '@/modules/features/provider-select';
import { buildOfferPartyFacts } from '../lib/offer-parties-summary.util';
import { scrollToOfferParty } from '../lib/offer-party-anchor.util';

/**
 * Сводка «Кому / От кого / Счёт» для «Сборки»: данные берутся из тех же
 * селекторов, что и карточки наверху экрана. Счёт — в виде, в каком он уходит
 * в запрос КП, поэтому «счета на все товары» без наборов для сравнения в
 * сводку не попадают.
 */
export const useOfferPartiesSummary = () => {
    const recipient = useAppSelector(selectOfferRecipient);
    const invoice = useAppSelector(selectOfferRequestInvoice);
    const { currentName } = useProviderChoice();

    const facts = useMemo(
        () => buildOfferPartyFacts({ recipient, providerName: currentName, invoice }),
        [recipient, currentName, invoice],
    );

    return { facts, goTo: scrollToOfferParty };
};
