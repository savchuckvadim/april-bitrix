'use client';

import { useMemo } from 'react';
import { useStore } from 'react-redux';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import type { RootState } from '@/modules/app/model/store';
import { selectCatalog } from '../../catalog';
import { selectOfferComposition } from '../../complect-variant';
import { selectOfferVariantsPayload } from '../../offer-document';
import { buildOfferPdfGenerateRequest, offerPdfRequestBlocker } from '../lib/build-offer-pdf-request';
import { offerPdfRequestKey } from '../lib/offer-pdf-request-key';
import { selectOfferPdfPrefs } from '../model/OfferPdfSlice';
import type { OfferPdfGenerateRequest, OfferPdfTemplateCode } from '../model/types';

export interface OfferPdfRequestInput {
    /** Формат PDF не выбран — запрос не собираем */
    enabled: boolean;
    /** Код стиля из списка стилей; null — список ещё не пришёл, собирать рано */
    templateCode: OfferPdfTemplateCode | null;
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
    // открытый вариант и настройки сделки уходят в запрос: смена любого из них пересобирает его и превью;
    // режим сделки в запрос не входит, его смена превью не трогает
    const variants = useAppSelector(selectOfferVariantsPayload);
    const composition = useAppSelector(selectOfferComposition);

    const request = useMemo<OfferPdfGenerateRequest | null>(() => {
        if (!enabled || blocker || !templateCode) return null;
        return buildOfferPdfGenerateRequest(store.getState(), {
            templateCode,
            palette,
            settings: prefs.settings,
            letter: prefs.letter,
            documentNumber: prefs.documentNumber,
        });
        // перечисленные зависимости — всё, из чего собирается запрос
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        enabled,
        blocker,
        store,
        prefs,
        templateCode,
        palette,
        general,
        alternative,
        recipient,
        provider,
        dealId,
        catalog,
        variants,
        composition,
    ]);

    // ключ по содержимому: пересборка запроса с теми же данными не запускает превью заново
    const requestKey = useMemo(() => (request ? offerPdfRequestKey(request) : null), [request]);

    return { request, requestKey, blocker };
};
