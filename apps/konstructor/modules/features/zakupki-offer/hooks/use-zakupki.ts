'use client';

import { useEffect } from 'react';
import { getCrmUrl } from '@workspace/bitrix';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { IS_PROD } from '@/modules/app/consts/app-global';
import { CONTRACT_DEAL_FIELDS, initDealDocumentFields } from '@/modules/entities/contract-document';
import {
    fetchZakupkiSettings,
    generateZakupkiOffer,
    resetZakupkiSettings,
    saveZakupkiSettings,
    selectZakupkiProviderFields,
    selectZakupkiState,
    zakupkiActions,
    zakupkiRequestBlocker,
    type ZakupkiProviderKey,
} from '@/modules/entities/zakupki';

/** Период договора — его печатает письмо «3 КП» (легаси OfferZakupkiMenu показывал эти два поля сделки). */
export const ZAKUPKI_DEAL_FIELDS = CONTRACT_DEAL_FIELDS.filter(field =>
    ['contract_start', 'contract_end'].includes(field.code),
);

/**
 * «3 КП для торгов»: настройки двух вымышленных поставщиков (свои или
 * портала), их правка и генерация трёх КП одной очередью.
 */
export const useZakupki = () => {
    const dispatch = useAppDispatch();
    const zakupki = useAppSelector(selectZakupkiState);
    const provider1 = useAppSelector(state => selectZakupkiProviderFields(state, 'provider1'));
    const provider2 = useAppSelector(state => selectZakupkiProviderFields(state, 'provider2'));
    const blocker = useAppSelector(zakupkiRequestBlocker);
    const portalReady = useAppSelector(state => Boolean(state.portal.current));
    const domain = useAppSelector(state => state.app.domain);
    const dealId = useAppSelector(state => state.app.dealId);

    useEffect(() => {
        if (zakupki.status === 'idle') void dispatch(fetchZakupkiSettings());
    }, [zakupki.status, dispatch]);

    useEffect(() => {
        if (portalReady) dispatch(initDealDocumentFields(ZAKUPKI_DEAL_FIELDS));
    }, [portalReady, dispatch]);

    const run = async () => {
        const ok = await dispatch(generateZakupkiOffer());
        if (!ok || !IS_PROD) return ok;
        const url = getCrmUrl(domain, 'deal', dealId);
        if (url) (window.top ?? window).location.replace(url);
        return ok;
    };

    return {
        isLoading: zakupki.status === 'loading' || zakupki.status === 'idle',
        error: zakupki.status === 'error' ? zakupki.error : null,
        settings: zakupki.settings,
        providers: { provider1, provider2 } satisfies Record<ZakupkiProviderKey, typeof provider1>,
        isEditing: zakupki.isEditing,
        setEditing: (value: boolean) => dispatch(zakupkiActions.setEditing(value)),
        setValue: (code: string, value: string) => dispatch(zakupkiActions.setDraftValue({ code, value })),
        hasDraft: Object.keys(zakupki.draft).length > 0,
        isSaving: zakupki.isSaving,
        saveError: zakupki.saveError,
        saveForUser: () => dispatch(saveZakupkiSettings('user')),
        saveForPortal: () => dispatch(saveZakupkiSettings('default')),
        resetToPortal: () => dispatch(resetZakupkiSettings()),
        blocker,
        isGenerating: zakupki.generate.status === 'generating',
        isDone: zakupki.generate.status === 'done',
        generateError: zakupki.generate.status === 'error' ? zakupki.generate.error : null,
        run,
    };
};
