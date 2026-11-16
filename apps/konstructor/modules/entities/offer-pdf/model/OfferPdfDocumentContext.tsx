'use client';

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import { useStore } from 'react-redux';
import type { RootState } from '@/modules/app/model/store';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { selectCatalog } from '../../catalog';
import { saveSnapshot } from '../../snapshot';
import { offerPdfApi, readOfferPdfError } from '../lib/api/offer-pdf.api';
import { buildOfferPdfGenerateRequest, offerPdfRequestBlocker } from '../lib/build-offer-pdf-request';
import { resolvePalette } from '../lib/offer-pdf-palette.util';
import { offerPdfActions, selectOfferPdfPrefs } from './OfferPdfSlice';
import {
    OFFER_DOCUMENT_FORMAT,
    type OfferDocumentFormat,
    type OfferPdfGenerateRequest,
    type OfferPdfGenerateResponse,
    type OfferPdfLetter,
    type OfferPdfSettings,
    type OfferPdfTemplateInfo,
} from './types';

/** Пауза перед авто-обновлением превью после правки данных */
const PREVIEW_DEBOUNCE_MS = 700;

export type OfferPdfPreviewPhase = 'idle' | 'loading' | 'ready' | 'failed';

export interface OfferPdfPreviewState {
    phase: OfferPdfPreviewPhase;
    objectUrl: string | null;
    error: string | null;
    durationMs: number | null;
    /** Данные изменились после последнего собранного превью */
    stale: boolean;
}

export type OfferPdfGenerateStatus = 'idle' | 'generating' | 'done' | 'error';

export interface OfferPdfGenerateState {
    status: OfferPdfGenerateStatus;
    result: OfferPdfGenerateResponse | null;
    error: string | null;
}

export interface OfferPdfDocumentContextValue {
    format: OfferDocumentFormat;
    setFormat: (format: OfferDocumentFormat) => void;
    templateCode: string;
    setTemplateCode: (code: string) => void;
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
    runGenerate: () => Promise<boolean>;
    resetGenerate: () => void;
}

const OfferPdfDocumentContext = createContext<OfferPdfDocumentContextValue | null>(null);

const INITIAL_PREVIEW: OfferPdfPreviewState = {
    phase: 'idle',
    objectUrl: null,
    error: null,
    durationMs: null,
    stale: false,
};

const INITIAL_GENERATE: OfferPdfGenerateState = { status: 'idle', result: null, error: null };

/**
 * КП в PDF на экране документа: список стилей, превью и результат живут
 * здесь; формат, стиль, настройки, письмо и номер — в сторе (offerPdf):
 * их запоминают слепок сделки и последний выбор менеджера.
 */
export const OfferPdfDocumentProvider = ({ children }: { children: ReactNode }) => {
    const store = useStore<RootState>();
    const dispatch = useAppDispatch();
    const prefs = useAppSelector(selectOfferPdfPrefs);

    const [templates, setTemplates] = useState<OfferPdfTemplateInfo[]>([]);
    const [templatesLoading, setTemplatesLoading] = useState(false);
    const [templatesError, setTemplatesError] = useState<string | null>(null);
    const templatesRequestedRef = useRef(false);

    const [preview, setPreview] = useState<OfferPdfPreviewState>(INITIAL_PREVIEW);
    const [generate, setGenerate] = useState<OfferPdfGenerateState>(INITIAL_GENERATE);

    const isPdf = prefs.format === OFFER_DOCUMENT_FORMAT.PDF;

    // --- шаблоны ---
    useEffect(() => {
        if (!isPdf || templatesRequestedRef.current) return;
        templatesRequestedRef.current = true;
        setTemplatesLoading(true);
        offerPdfApi
            .listTemplates()
            .then(list => {
                setTemplates(list);
                setTemplatesError(null);
            })
            .catch(async error => {
                templatesRequestedRef.current = false;
                setTemplatesError(await readOfferPdfError(error));
            })
            .finally(() => setTemplatesLoading(false));
    }, [isPdf]);

    // --- стиль и гамма: сохранённого стиля уже нет — первый доступный ---
    const template = useMemo(
        () => templates.find(item => item.code === prefs.templateCode) ?? templates[0] ?? null,
        [templates, prefs.templateCode],
    );
    const templateCode = template?.code ?? prefs.templateCode;
    const palette = resolvePalette(template, prefs.palette);

    // --- запрос: пересобираем, когда меняется то, что в нём печатается ---
    const blocker = useAppSelector(offerPdfRequestBlocker);
    const general = useAppSelector(state => state.rowSet.general);
    const alternative = useAppSelector(state => state.rowSet.alternative);
    const recipient = useAppSelector(state => state.offerDocument.recipient);
    const provider = useAppSelector(state => state.documentProvider.current);
    const dealId = useAppSelector(state => state.app.dealId);
    const catalog = useAppSelector(selectCatalog);

    const request = useMemo<OfferPdfGenerateRequest | null>(() => {
        if (!isPdf || blocker) return null;
        return buildOfferPdfGenerateRequest(store.getState(), {
            templateCode,
            palette,
            settings: prefs.settings,
            letter: prefs.letter,
            documentNumber: prefs.documentNumber,
        });
        // перечисленные зависимости — всё, из чего собирается запрос
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPdf, blocker, store, prefs, templateCode, palette, general, alternative, recipient, provider, dealId, catalog]);

    const requestKey = useMemo(() => (request ? JSON.stringify(request) : null), [request]);
    const requestRef = useRef(request);
    const requestKeyRef = useRef(requestKey);
    requestRef.current = request;
    requestKeyRef.current = requestKey;

    // --- превью ---
    const previewSeqRef = useRef(0);
    const abortRef = useRef<AbortController | null>(null);
    const objectUrlRef = useRef<string | null>(null);
    const renderedKeyRef = useRef<string | null>(null);

    const runPreview = useCallback(async () => {
        const current = requestRef.current;
        const key = requestKeyRef.current;
        if (!current || !key) return;

        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        const seq = ++previewSeqRef.current;

        setPreview(prev => ({ ...prev, phase: 'loading', error: null }));
        const started = performance.now();
        try {
            const blob = await offerPdfApi.preview(current, controller.signal);
            if (seq !== previewSeqRef.current) return;
            if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
            const objectUrl = URL.createObjectURL(blob);
            objectUrlRef.current = objectUrl;
            renderedKeyRef.current = key;
            setPreview({
                phase: 'ready',
                objectUrl,
                error: null,
                durationMs: Math.round(performance.now() - started),
                stale: false,
            });
        } catch (error) {
            if (seq !== previewSeqRef.current || controller.signal.aborted) return;
            const message = await readOfferPdfError(error);
            setPreview(prev => ({ ...prev, phase: 'failed', error: message }));
        }
    }, []);

    useEffect(() => {
        if (!isPdf || !requestKey) return;
        if (renderedKeyRef.current === requestKey) return;
        setPreview(prev => (prev.objectUrl ? { ...prev, stale: true } : prev));
        const timer = setTimeout(() => void runPreview(), PREVIEW_DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [isPdf, requestKey, runPreview]);

    useEffect(
        () => () => {
            abortRef.current?.abort();
            if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        },
        [],
    );

    // --- формирование: сначала слепок сделки, чтобы выбор стиля пережил уход со страницы ---
    const runGenerate = useCallback(async () => {
        const current = requestRef.current;
        if (!current) return false;
        setGenerate({ status: 'generating', result: null, error: null });
        try {
            await dispatch(saveSnapshot());
            const result = await offerPdfApi.generate(current);
            setGenerate({ status: 'done', result, error: null });
            return true;
        } catch (error) {
            setGenerate({ status: 'error', result: null, error: await readOfferPdfError(error) });
            return false;
        }
    }, [dispatch]);

    const value = useMemo<OfferPdfDocumentContextValue>(
        () => ({
            format: prefs.format,
            setFormat: format => dispatch(offerPdfActions.setFormat(format)),
            templateCode,
            setTemplateCode: code => dispatch(offerPdfActions.setTemplateCode(code)),
            template,
            palette,
            setPalette: next => dispatch(offerPdfActions.setPalette(next)),
            templates,
            templatesLoading,
            templatesError,
            settings: prefs.settings,
            setSettings: patch => dispatch(offerPdfActions.setSettings(patch)),
            letter: prefs.letter,
            setLetter: patch => dispatch(offerPdfActions.setLetter(patch)),
            documentNumber: prefs.documentNumber,
            setDocumentNumber: value => dispatch(offerPdfActions.setDocumentNumber(value)),
            blocker,
            preview,
            refreshPreview: () => void runPreview(),
            generate,
            runGenerate,
            resetGenerate: () => setGenerate(INITIAL_GENERATE),
        }),
        [
            dispatch,
            prefs,
            templateCode,
            template,
            palette,
            templates,
            templatesLoading,
            templatesError,
            blocker,
            preview,
            runPreview,
            generate,
            runGenerate,
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
