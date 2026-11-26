'use client';

import { useMemo } from 'react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    presentationSummary,
    selectOfferPresentation,
    selectOfferRecipient,
    selectOfferRequestInvoice,
} from '@/modules/entities/offer-document';
import { useProviderChoice } from '@/modules/features/provider-select';
import { buildOfferPartyFacts } from '../lib/offer-parties-summary.util';
import { scrollToOfferParty } from '../lib/offer-party-anchor.util';

/**
 * Сводка «Кому / От кого / Счёт / Презентация» для «Сборки»: данные берутся из
 * тех же селекторов, что и карточки наверху экрана. Счёт — в виде, в каком он
 * уходит в запрос КП, поэтому «счета на все товары» без наборов для сравнения в
 * сводку не попадают. Строка презентации есть только при ответе «Да».
 */
export const useOfferPartiesSummary = () => {
    const recipient = useAppSelector(selectOfferRecipient);
    const invoice = useAppSelector(selectOfferRequestInvoice);
    const presentationState = useAppSelector(selectOfferPresentation);
    const { currentName } = useProviderChoice();

    const facts = useMemo(
        () =>
            buildOfferPartyFacts({
                recipient,
                providerName: currentName,
                invoice,
                presentation: presentationSummary(presentationState),
            }),
        [recipient, currentName, invoice, presentationState],
    );

    return { facts, goTo: scrollToOfferParty };
};
