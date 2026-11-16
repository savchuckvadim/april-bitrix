'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { offerPdfApi, readOfferPdfError } from '../lib/api/offer-pdf.api';
import type { OfferPdfGenerateRequest, OfferPdfPreviewState } from '../model/types';

/** Пауза перед авто-обновлением превью после правки данных */
const PREVIEW_DEBOUNCE_MS = 700;

const INITIAL_PREVIEW: OfferPdfPreviewState = {
    phase: 'idle',
    objectUrl: null,
    error: null,
    durationMs: null,
    stale: false,
};

/**
 * Превью документа: собирается само через паузу после правки запроса.
 * Новый запрос отменяет прежний; опоздавший ответ отбрасывается; object URL
 * прошлого превью освобождается.
 */
export const useOfferPdfPreview = (request: OfferPdfGenerateRequest | null, requestKey: string | null) => {
    const [preview, setPreview] = useState<OfferPdfPreviewState>(INITIAL_PREVIEW);

    // сборка берёт последний запрос, а не тот, что был при создании колбэка
    const requestRef = useRef(request);
    const requestKeyRef = useRef(requestKey);
    requestRef.current = request;
    requestKeyRef.current = requestKey;

    const seqRef = useRef(0);
    const abortRef = useRef<AbortController | null>(null);
    const objectUrlRef = useRef<string | null>(null);
    const renderedKeyRef = useRef<string | null>(null);

    const run = useCallback(async () => {
        const current = requestRef.current;
        const key = requestKeyRef.current;
        if (!current || !key) return;

        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        const seq = ++seqRef.current;

        setPreview(prev => ({ ...prev, phase: 'loading', error: null }));
        const started = performance.now();
        try {
            const blob = await offerPdfApi.preview(current, controller.signal);
            if (seq !== seqRef.current) return;
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
            if (seq !== seqRef.current || controller.signal.aborted) return;
            const message = await readOfferPdfError(error);
            setPreview(prev => ({ ...prev, phase: 'failed', error: message }));
        }
    }, []);

    useEffect(() => {
        if (!requestKey || renderedKeyRef.current === requestKey) return;
        setPreview(prev => (prev.objectUrl ? { ...prev, stale: true } : prev));
        const timer = setTimeout(() => void run(), PREVIEW_DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [requestKey, run]);

    useEffect(
        () => () => {
            abortRef.current?.abort();
            if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        },
        [],
    );

    const refresh = useCallback(() => void run(), [run]);

    return { preview, refresh };
};
