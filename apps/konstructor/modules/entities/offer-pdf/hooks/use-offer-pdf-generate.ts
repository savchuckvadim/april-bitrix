'use client';

import { useCallback, useRef, useState } from 'react';
import { useAppDispatch } from '@/modules/app/lib/hooks/redux';
import { saveSnapshot } from '../../snapshot';
import { offerPdfApi, readOfferPdfError } from '../lib/api/offer-pdf.api';
import type { OfferPdfGenerateRequest, OfferPdfGenerateState } from '../model/types';

const INITIAL_GENERATE: OfferPdfGenerateState = { status: 'idle', result: null, error: null };

/**
 * «Сформировать PDF»: сначала слепок сделки (чтобы стиль и сборка пережили
 * уход со страницы, как у Word-потока), затем файл. Успех — по ответу бэка.
 */
export const useOfferPdfGenerate = (request: OfferPdfGenerateRequest | null) => {
    const dispatch = useAppDispatch();
    const [generate, setGenerate] = useState<OfferPdfGenerateState>(INITIAL_GENERATE);
    const requestRef = useRef(request);
    requestRef.current = request;

    const run = useCallback(async (): Promise<boolean> => {
        const current = requestRef.current;
        if (!current) return false;
        setGenerate({ status: 'generating', result: null, error: null });
        try {
            // слепок не сохранился — не повод не отдать документ: ошибку покажет статус слепка
            await dispatch(saveSnapshot());
            const result = await offerPdfApi.generate(current);
            setGenerate({ status: 'done', result, error: null });
            return true;
        } catch (error) {
            setGenerate({ status: 'error', result: null, error: await readOfferPdfError(error) });
            return false;
        }
    }, [dispatch]);

    const reset = useCallback(() => setGenerate(INITIAL_GENERATE), []);

    return { generate, run, reset };
};
