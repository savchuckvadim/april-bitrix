'use client';

import React, {
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
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { selectCatalog } from '../../catalog';
import { offerPdfApi, readOfferPdfError } from '../lib/api/offer-pdf.api';
import { buildOfferPdfGenerateRequest, offerPdfRequestBlocker } from '../lib/build-offer-pdf-request';
import { loadOfferPdfPrefs, OFFER_PDF_DEFAULT_PREFS, saveOfferPdfPrefs } from '../lib/offer-pdf-storage';
import {
    OFFER_DOCUMENT_FORMAT,
    type OfferDocumentFormat,
    type OfferPdfDocumentPrefs,
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
 * Состояние КП в PDF на экране документа: формат, шаблон, настройки,
 * письмо, превью и результат. Живёт в контексте экрана, а не в Redux:
 * нужно только здесь, а выбор менеджера запоминается в браузере.
 */
export const OfferPdfDocumentProvider = ({ children }: { children: ReactNode }) => {
    const store = useStore<RootState>();
    const [prefs, setPrefs] = useState<OfferPdfDocumentPrefs>(OFFER_PDF_DEFAULT_PREFS);
    const prefsLoadedRef = useRef(false);

    const [templates, setTemplates] = useState<OfferPdfTemplateInfo[]>([]);
    const [templatesLoading, setTemplatesLoading] = useState(false);
    const [templatesError, setTemplatesError] = useState<string | null>(null);
    const templatesRequestedRef = useRef(false);

    const [preview, setPreview] = useState<OfferPdfPreviewState>(INITIAL_PREVIEW);
    const [generate, setGenerate] = useState<OfferPdfGenerateState>(INITIAL_GENERATE);

    // хранилище браузера читаем после монтирования — иначе разойдётся с SSR
    useEffect(() => {
        setPrefs(loadOfferPdfPrefs());
        prefsLoadedRef.current = true;
    }, []);

    useEffect(() => {
        if (prefsLoadedRef.current) saveOfferPdfPrefs(prefs);
    }, [prefs]);

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
                // сохранённого кода уже нет — берём первый доступный
                const first = list[0];
                setPrefs(prev =>
                    first && !list.some(item => item.code === prev.templateCode)
                        ? { ...prev, templateCode: first.code }
                        : prev,
                );
            })
            .catch(async error => {
                templatesRequestedRef.current = false;
                setTemplatesError(await readOfferPdfError(error));
            })
            .finally(() => setTemplatesLoading(false));
    }, [isPdf]);

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
            templateCode: prefs.templateCode,
            settings: prefs.settings,
            letter: prefs.letter,
            documentNumber: prefs.documentNumber,
        });
        // перечисленные зависимости — всё, из чего собирается запрос
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPdf, blocker, store, prefs, general, alternative, recipient, provider, dealId, catalog]);

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

    // --- формирование ---
    const runGenerate = useCallback(async () => {
        const current = requestRef.current;
        if (!current) return false;
        setGenerate({ status: 'generating', result: null, error: null });
        try {
            const result = await offerPdfApi.generate(current);
            setGenerate({ status: 'done', result, error: null });
            return true;
        } catch (error) {
            setGenerate({ status: 'error', result: null, error: await readOfferPdfError(error) });
            return false;
        }
    }, []);

    const value = useMemo<OfferPdfDocumentContextValue>(
        () => ({
            format: prefs.format,
            setFormat: format => setPrefs(prev => ({ ...prev, format })),
            templateCode: prefs.templateCode,
            setTemplateCode: templateCode => setPrefs(prev => ({ ...prev, templateCode })),
            templates,
            templatesLoading,
            templatesError,
            settings: prefs.settings,
            setSettings: patch => setPrefs(prev => ({ ...prev, settings: { ...prev.settings, ...patch } })),
            letter: prefs.letter,
            setLetter: patch => setPrefs(prev => ({ ...prev, letter: { ...prev.letter, ...patch } })),
            documentNumber: prefs.documentNumber,
            setDocumentNumber: documentNumber => setPrefs(prev => ({ ...prev, documentNumber })),
            blocker,
            preview,
            refreshPreview: () => void runPreview(),
            generate,
            runGenerate,
            resetGenerate: () => setGenerate(INITIAL_GENERATE),
        }),
        [prefs, templates, templatesLoading, templatesError, blocker, preview, runPreview, generate, runGenerate],
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
