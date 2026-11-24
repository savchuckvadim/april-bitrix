'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { useAppDispatch } from '@/modules/app/lib/hooks/redux';
import { takeInvoiceNumber } from '../../offer-document';
import { saveSnapshot } from '../../snapshot';
import { offerPdfApi, readOfferPdfError } from '../lib/api/offer-pdf.api';
import { withOfferPdfInvoice } from '../lib/build-offer-pdf-request';
import { readOfferPdfResult } from '../lib/offer-pdf-result';
import type { OfferPdfGenerateRequest, OfferPdfGenerateState } from '../model/types';

const INITIAL_GENERATE: OfferPdfGenerateState = { status: 'idle', result: null, error: null };

/**
 * «Сформировать PDF»: блокер (в том числе обязательный тип клиента) → слепок
 * сделки (чтобы стиль и сборка пережили уход со страницы, как у Word-потока) →
 * номер счёта у нумератора, если счёт просят и номер пуст → файл вместе со
 * счётом. Успех — по ответу бэка.
 */
export const useOfferPdfGenerate = (request: OfferPdfGenerateRequest | null, blocker: string | null) => {
    const dispatch = useAppDispatch();
    const [generate, setGenerate] = useState<OfferPdfGenerateState>(INITIAL_GENERATE);
    const requestRef = useRef(request);
    requestRef.current = request;
    const blockerRef = useRef(blocker);
    blockerRef.current = blocker;

    const run = useCallback(async (): Promise<boolean> => {
        const current = requestRef.current;
        if (!current || blockerRef.current) return false;
        setGenerate({ status: 'generating', result: null, error: null });
        try {
            // слепок не сохранился — не повод не отдать документ: ошибку покажет статус слепка
            await dispatch(saveSnapshot());
            // номер берём перед самым запросом: сорвавшийся слепок не должен жечь номер нумератора
            const taken = await dispatch(takeInvoiceNumber());
            if (taken.error) {
                setGenerate({ status: 'error', result: null, error: taken.error });
                return false;
            }
            const result = await offerPdfApi.generate(withOfferPdfInvoice(current, taken.invoice));
            setGenerate({ status: 'done', result, error: null });
            return true;
        } catch (error) {
            setGenerate({ status: 'error', result: null, error: await readOfferPdfError(error) });
            return false;
        }
    }, [dispatch]);

    const reset = useCallback(() => setGenerate(INITIAL_GENERATE), []);

    // ссылки и предупреждения для экрана; пока ответа нет — null
    const outcome = useMemo(() => (generate.result ? readOfferPdfResult(generate.result) : null), [generate.result]);

    return { generate, outcome, run, reset };
};
