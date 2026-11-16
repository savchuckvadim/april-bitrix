'use client';

import { useMemo } from 'react';
import { useStore } from 'react-redux';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import type { RootState } from '@/modules/app/model/store';
import { selectCatalog } from '../../catalog';
import { buildOfferPdfGenerateRequest, offerPdfRequestBlocker } from '../lib/build-offer-pdf-request';
import { selectOfferPdfPrefs } from '../model/OfferPdfSlice';
import type { OfferPdfGenerateRequest } from '../model/types';

export interface OfferPdfRequestInput {
    /** Формат PDF не выбран — запрос не собираем */
    enabled: boolean;
    templateCode: string;
    palette: string | null;
}

/**
 * Запрос КП в PDF из стора и выбранного стиля. Пересобирается, когда меняется
 * то, что в нём печатается; `requestKey` — чтобы превью не собиралось дважды
 * на один и тот же запрос.
 */
export const useOfferPdfRequest = ({ enabled, templateCode, palette }: OfferPdfRequestInput) => {
    const store = useStore<RootState>();
    const prefs = useAppSelector(selectOfferPdfPrefs);
    const blocker = useAppSelector(offerPdfRequestBlocker);
    const general = useAppSelector(state => state.rowSet.general);
    const alternative = useAppSelector(state => state.rowSet.alternative);
    const recipient = useAppSelector(state => state.offerDocument.recipient);
    const provider = useAppSelector(state => state.documentProvider.current);
    const dealId = useAppSelector(state => state.app.dealId);
    const catalog = useAppSelector(selectCatalog);

    const request = useMemo<OfferPdfGenerateRequest | null>(() => {
        if (!enabled || blocker) return null;
        return buildOfferPdfGenerateRequest(store.getState(), {
            templateCode,
            palette,
            settings: prefs.settings,
            letter: prefs.letter,
            documentNumber: prefs.documentNumber,
        });
        // перечисленные зависимости — всё, из чего собирается запрос
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, blocker, store, prefs, templateCode, palette, general, alternative, recipient, provider, dealId, catalog]);

    const requestKey = useMemo(() => (request ? JSON.stringify(request) : null), [request]);

    return { request, requestKey, blocker };
};
