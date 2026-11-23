'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { useOfferPdfGenerate } from '../hooks/use-offer-pdf-generate';
import { useOfferPdfPreview } from '../hooks/use-offer-pdf-preview';
import { useOfferPdfRequest } from '../hooks/use-offer-pdf-request';
import { useOfferPdfStyle } from '../hooks/use-offer-pdf-style';
import type { OfferPdfOutcome } from '../lib/offer-pdf-result';
import { offerPdfActions, selectOfferPdfPrefs } from './OfferPdfSlice';
import {
    OFFER_DOCUMENT_FORMAT,
    type OfferDocumentFormat,
    type OfferPdfGenerateState,
    type OfferPdfLetter,
    type OfferPdfPreviewState,
    type OfferPdfSettings,
    type OfferPdfTemplateInfo,
} from './types';

export interface OfferPdfDocumentContextValue {
    format: OfferDocumentFormat;
    setFormat: (format: OfferDocumentFormat) => void;
    templateCode: string;
    /** Стиль и гамма; гамма не задана — первая гамма стиля */
    selectStyle: (templateCode: string, palette?: string | null) => void;
    /** Выбранный стиль из списка; список ещё не пришёл — null */
    template: OfferPdfTemplateInfo | null;
    /** Гамма, которая уйдёт в запрос: выбранная или первая у стиля; без гамм — null */
    palette: string | null;
    setPalette: (palette: string) => void;
    templates: OfferPdfTemplateInfo[];
    templatesLoading: boolean;
    templatesError: string | null;
    settings: OfferPdfSettings;
    setSettings: (patch: Partial<OfferPdfSettings>) => void;
    letter: OfferPdfLetter;
    setLetter: (patch: Partial<OfferPdfLetter>) => void;
    documentNumber: string;
    setDocumentNumber: (value: string) => void;
    /** Почему PDF сейчас не собрать; null — можно */
    blocker: string | null;
    preview: OfferPdfPreviewState;
    refreshPreview: () => void;
    generate: OfferPdfGenerateState;
    /** Ссылки на файлы и предупреждения бэка из ответа генерации; ответа нет — null */
    outcome: OfferPdfOutcome | null;
    runGenerate: () => Promise<boolean>;
    resetGenerate: () => void;
}

const OfferPdfDocumentContext = createContext<OfferPdfDocumentContextValue | null>(null);

/**
 * КП в PDF на экране документа. Провайдер только собирает части: настройки
 * из стора (offerPdf — их запоминают слепок сделки и последний выбор
 * менеджера), стиль (общий с витриной), запрос, превью и формирование.
 */
export const OfferPdfDocumentProvider = ({ children }: { children: ReactNode }) => {
    const dispatch = useAppDispatch();
    const prefs = useAppSelector(selectOfferPdfPrefs);
    const isPdf = prefs.format === OFFER_DOCUMENT_FORMAT.PDF;

    // список стилей грузится, только когда выбран PDF
    const style = useOfferPdfStyle(isPdf);
    const { request, requestKey, blocker } = useOfferPdfRequest({
        enabled: isPdf,
        // код берём у стиля из списка бэка: сохранённого стиля там может уже не быть
        templateCode: style.template?.code ?? null,
        palette: style.palette,
    });
    const { preview, refresh } = useOfferPdfPreview(request, requestKey);
    const { generate, outcome, run, reset } = useOfferPdfGenerate(request);

    const value = useMemo<OfferPdfDocumentContextValue>(
        () => ({
            format: prefs.format,
            setFormat: format => dispatch(offerPdfActions.setFormat(format)),
            templateCode: style.templateCode,
            selectStyle: style.select,
            template: style.template,
            palette: style.palette,
            setPalette: style.setPalette,
            templates: style.templates,
            templatesLoading: style.loading,
            templatesError: style.error,
            settings: prefs.settings,
            setSettings: patch => dispatch(offerPdfActions.setSettings(patch)),
            letter: prefs.letter,
            setLetter: patch => dispatch(offerPdfActions.setLetter(patch)),
            documentNumber: prefs.documentNumber,
            setDocumentNumber: number => dispatch(offerPdfActions.setDocumentNumber(number)),
            blocker,
            preview,
            refreshPreview: refresh,
            generate,
            outcome,
            runGenerate: run,
            resetGenerate: reset,
        }),
        [
            dispatch,
            prefs,
            style.templateCode,
            style.template,
            style.palette,
            style.templates,
            style.loading,
            style.error,
            style.select,
            style.setPalette,
            blocker,
            preview,
            refresh,
            generate,
            outcome,
            run,
            reset,
        ],
    );

    return <OfferPdfDocumentContext.Provider value={value}>{children}</OfferPdfDocumentContext.Provider>;
};

export const useOfferPdfDocument = (): OfferPdfDocumentContextValue => {
    const context = useContext(OfferPdfDocumentContext);
    if (!context) {
        throw new Error('useOfferPdfDocument — только внутри OfferPdfDocumentProvider');
    }
    return context;
};
